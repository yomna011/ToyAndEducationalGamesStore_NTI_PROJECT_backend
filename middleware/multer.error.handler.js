const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err.message);
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err.message === 'Invalid file type') {
    console.error('File type error:', err.message);
    return res.status(400).json({ error: 'Only PNG, JPEG, JPG, or MP4 files are allowed' });
  }
  console.error('Unexpected error:', err);
  return res.status(500).json({ error: 'Unexpected error during file upload' });
};

module.exports = multerErrorHandler;