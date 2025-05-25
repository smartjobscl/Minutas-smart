const express = require('express');
const cors = require('cors');
const uploadToDriveRouter = require('./uploadToDrive');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploadToDrive', uploadToDriveRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});
