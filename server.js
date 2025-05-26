const express = require('express');
const cors = require('cors');
const path = require('path');
const uploadToDriveRouter = require('./uploadToDrive');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API
app.use('/uploadToDrive', uploadToDriveRouter);

// Servir React en producción
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Fallback para rutas desconocidas (React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});
