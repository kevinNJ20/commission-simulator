// Base de données Commission UEMOA - Traçabilité
class Database {
  constructor() {
    this.operations = new Map();
    this.statistiques = new Map();
    this.metriques = {
      operationsTotal: 0,
      operationsAujourdhui: 0,
      paysActifs: new Set(),
      derniereMiseAJour: new Date()
    };
    
    this.initStatistiques();
  }

  initStatistiques() {
    // Initialiser les statistiques par pays
    const pays = ['BFA', 'CIV', 'MLI', 'NER', 'SEN', 'TGO', 'BEN', 'GNB'];
    pays.forEach(code => {
      this.statistiques.set(code, {
        code,
        operationsEnvoyees: 0,
        operationsRecues: 0,
        volumeTraite: 0,
        dernierActivite: null
      });
    });
  }

  enregistrerOperation(operation) {
    const id = operation.numeroOperation || `OP${Date.now()}`;
    const nouvelleOperation = {
      ...operation,
      id,
      dateEnregistrement: new Date(),
      statut: 'ENREGISTREE'
    };
    
    this.operations.set(id, nouvelleOperation);
    this.mettreAJourMetriques(nouvelleOperation);
    
    console.log('📊 Opération enregistrée:', id);
    return nouvelleOperation;
  }

  mettreAJourMetriques(operation) {
    // Métriques globales
    this.metriques.operationsTotal++;
    this.metriques.paysActifs.add(operation.paysOrigine);
    this.metriques.paysActifs.add(operation.paysDestination);
    
    const aujourdhui = new Date().toDateString();
    if (new Date(operation.dateEnregistrement).toDateString() === aujourdhui) {
      this.metriques.operationsAujourdhui++;
    }
    
    // Statistiques par pays
    if (operation.paysOrigine) {
      const statsPaysOrigine = this.statistiques.get(operation.paysOrigine);
      if (statsPaysOrigine) {
        statsPaysOrigine.operationsEnvoyees++;
        statsPaysOrigine.dernierActivite = new Date();
      }
    }
    
    if (operation.paysDestination) {
      const statsPaysDestination = this.statistiques.get(operation.paysDestination);
      if (statsPaysDestination) {
        statsPaysDestination.operationsRecues++;
        statsPaysDestination.dernierActivite = new Date();
      }
    }
  }

  getOperations(limit = 50) {
    const operations = Array.from(this.operations.values());
    return operations
      .sort((a, b) => new Date(b.dateEnregistrement) - new Date(a.dateEnregistrement))
      .slice(0, limit);
  }

  getStatistiquesGlobales() {
    return {
      ...this.metriques,
      paysActifs: Array.from(this.metriques.paysActifs),
      derniereMiseAJour: new Date()
    };
  }

  getStatistiquesParPays() {
    return Array.from(this.statistiques.values());
  }

  getOperationsParType() {
    const operations = Array.from(this.operations.values());
    const parType = {};
    
    operations.forEach(op => {
      const type = op.typeOperation || 'INCONNU';
      parType[type] = (parType[type] || 0) + 1;
    });
    
    return parType;
  }

  getOperationsParCorridor() {
    const operations = Array.from(this.operations.values());
    const parCorridor = {};
    
    operations.forEach(op => {
      if (op.paysOrigine && op.paysDestination) {
        const corridor = `${op.paysOrigine} → ${op.paysDestination}`;
        parCorridor[corridor] = (parCorridor[corridor] || 0) + 1;
      }
    });
    
    return Object.entries(parCorridor)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }
}

// Instance singleton
const db = new Database();
module.exports = db;