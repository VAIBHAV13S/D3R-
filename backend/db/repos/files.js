const { query } = require('../client');
const { v4: uuidv4 } = require('uuid');

async function saveUploadedFile({ cid, documentType, uploader, originalName, mimeType, sizeBytes }) {
  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO uploadedfiles (id, cid, documenttype, uploader, originalname, mimetype, sizebytes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, cid, documenttype AS "documentType", uploader, originalname AS "originalName", mimetype AS "mimeType", sizebytes AS "sizeBytes", createdat AS "createdAt"`,
    [id, cid, documentType, uploader || null, originalName || null, mimeType || null, sizeBytes || null]
  );
  return rows[0];
}

module.exports = { saveUploadedFile };
