const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const LostItem = require('../models/LostItem');

// Setup multer untuk upload gambar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Menambahkan timestamp untuk nama unik
    }
});

const upload = multer({ storage: storage });

// Endpoint untuk menambahkan data barang hilang
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { name, contact, description, location } = req.body;

        if (!name || !contact || !description || !location) {
            return res.status(400).json({ message: 'Semua data harus diisi!' });
        }

        // Menyimpan nama file gambar
        const image = req.file ? req.file.filename : null;

        const newItem = new LostItem({ name, contact, description, location, image });
        await newItem.save();

        res.status(201).json({ message: 'Data barang berhasil disimpan.', data: newItem });
    } catch (error) {
        console.error('Error saat menyimpan data:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});

module.exports = router;
