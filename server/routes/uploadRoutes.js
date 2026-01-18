import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import path from 'path';

const router = express.Router();

router.post('/', upload.single('image'), (req, res) => {
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

router.post('/multiple', upload.array('images', 5), (req, res) => {
    const paths = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`);
    res.send(paths);
});

export default router;
