const express = require('express');
const cors = require('cors');
const path = require('path');
const uploadToDriveRouter = require('./uploadToDrive');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API routes
app.use('/uploadToDrive', uploadToDriveRouter);

// 🟢 Servir frontend (React build)
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Redirigir todo lo demás a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Puerto para Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});
