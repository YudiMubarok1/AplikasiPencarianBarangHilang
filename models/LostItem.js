const mongoose = require('mongoose');

const LostItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    location: {
        type: String, // Menyimpan lokasi barang hilang
        required: true,
    },
    image: {
        type: String, // Menyimpan nama file gambar yang diupload
    },
});

module.exports = mongoose.model('LostItem', LostItemSchema);
