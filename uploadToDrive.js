const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const { PassThrough } = require('stream');

const KEYFILEPATH = './uploader-minutas.json';
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const FOLDER_ID = '1q3-ngwLrem4WJJkgMmdj3d8ErQWnrn2q'; // <-- solo el ID, NO el link entero

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});
const drive = google.drive({ version: 'v3', auth });

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

async function uploadFileToDrive(buffer, filename, mimetype) {
  const stream = new PassThrough();
  stream.end(buffer);

  const fileMetadata = {
    name: filename,
    parents: [FOLDER_ID]
  };

  const media = {
    mimeType: mimetype,
    body: stream
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id'
  });

  await drive.permissions.create({
    fileId: file.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  const result = await drive.files.get({
    fileId: file.data.id,
    fields: 'webViewLink'
  });

  return {
    id: file.data.id,
    link: result.data.webViewLink
  };
}

router.post('/', upload.single('drive_file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Archivo no recibido' });
    }

    const { buffer, originalname, mimetype } = req.file;
    const uploaded = await uploadFileToDrive(buffer, originalname, mimetype);

    res.json({
      success: true,
      message: 'Subido correctamente',
      fileId: uploaded.id,
      link: uploaded.link
    });
  } catch (err) {
    console.error('Error al subir a Drive:', err.message);
    res.status(500).json({ success: false, message: 'Error interno', error: err.message });
  }
});

module.exports = router;
