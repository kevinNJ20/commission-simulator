const database = require('../../lib/database');

// ✅ Fonction utilitaire pour convertir JSON en CSV
function jsonToCSV(data, headers) {
  if (!data || data.length === 0) return '';
  
  // En-têtes CSV
  const csvHeaders = headers.join(',');
  
  // Lignes de données
  const csvRows = data.map(row => {
    return headers.map(header => {
      let value = row[header];
      
      // Gestion des valeurs nulles/undefined
      if (value === null || value === undefined) {
        value = '';
      }
      
      // Gestion des objets/tableaux
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Échapper les virgules et guillemets
      value = String(value).replace(/"/g, '""');
      
      // Encadrer avec des guillemets si nécessaire
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`;
      }
      
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { format = 'csv', type = 'global' } = req.query;
      
      const donnees = {
        statistiques: database.obtenirStatistiquesGlobales(),
        operations: database.obtenirOperations(1000),
        corridors: database.obtenirCorridorsActifs(),
        exportTimestamp: new Date().toISOString()
      };
      
      if (format === 'csv') {
        // ✅ Export CSV pour les opérations
        const operationsCSV = donnees.operations.map(op => ({
          'ID': op.id,
          'Numéro Opération': op.numeroOperation,
          'Type Opération': op.typeOperation,
          'Pays Origine': op.paysOrigine,
          'Pays Destination': op.paysDestination,
          'Étape Workflow': op.etapeWorkflow || 'N/A',
          'Date Enregistrement': op.dateEnregistrement,
          'Statut': op.statut || 'TRACE_COMMISSION'
        }));
        
        const csvHeaders = [
          'ID',
          'Numéro Opération',
          'Type Opération',
          'Pays Origine',
          'Pays Destination',
          'Étape Workflow',
          'Date Enregistrement',
          'Statut'
        ];
        
        const csvContent = jsonToCSV(operationsCSV, csvHeaders);
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="commission-uemoa-export-${new Date().toISOString().split('T')[0]}.csv"`);
        
        // ✅ BOM UTF-8 pour Excel
        res.status(200).send('\uFEFF' + csvContent);
        
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="commission-uemoa-export-${new Date().toISOString().split('T')[0]}.json"`);
        res.status(200).json(donnees);
      } else {
        res.status(400).json({ error: 'Format non supporté. Utilisez format=csv ou format=json' });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Erreur export',
        message: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};