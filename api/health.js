module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const healthStatus = {
      service: 'Commission UEMOA - Traçabilité',
      status: 'UP',
      version: '1.0.0-POC',
      timestamp: new Date().toISOString(),
      commission: {
        nom: 'Commission UEMOA',
        siege: 'Ouagadougou, Burkina Faso',
        fonction: 'TRACABILITE_INTERCONNEXION'
      },
      endpoints: {
        tracabiliteEnregistrer: '/api/tracabilite/enregistrer',
        statistiques: '/api/statistiques',
        dashboard: '/api/dashboard'
      }
    };

    res.status(200).json(healthStatus);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};