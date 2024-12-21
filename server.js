const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Static folder
app.use(express.static('public'));

// Endpoint untuk mengirimkan email
app.post('/send-email', (req, res) => {
    const { userEmail, location } = req.body;

    // Membuat transporter untuk mengirimkan email
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Menggunakan layanan Gmail
        auth: {
            user: process.env.EMAIL_USER, // Email pengirim (dari file .env)
            pass: process.env.EMAIL_PASS, // Password atau App Password Gmail (dari file .env)
        },
    });

    // Menyusun konten email
    const mailOptions = {
        from: process.env.EMAIL_USER, // Pengirim
        to: userEmail, // Email penerima (email yang dikirim dari frontend)
        subject: 'Barang Telah Ditemukan!!', // Subjek email
        text: `Kami akan mengantarkan barang anda yg hilang, berdasarkan Titik Lokasi Anda: Latitude ${location.lat}, Longitude ${location.lon}`, // Isi email
    };

    // Mengirim email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
            return res.status(500).json({ success: false, message: 'Gagal mengirim email' });
        } else {
            console.log('Email sent: ' + info.response);
            return res.status(200).json({ success: true, message: 'Email berhasil dikirim' });
        }
    });
});

// Menggunakan rute
const lostItemsRoute = require('./routes/lostItems');
app.use('/api/lost-items', lostItemsRoute);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server berjalan pada port ${PORT}`));
