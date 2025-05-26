const express = require('express');
const cors = require('cors');
const path = require('path');
const uploadToDriveRouter = require('./uploadToDrive');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos de React
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Ruta de API
app.use('/uploadToDrive', uploadToDriveRouter);

// Fallback para React (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Puerto dinámico para Railway
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});
