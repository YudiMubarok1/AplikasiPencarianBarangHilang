const socket = io.connect('http://localhost:5000');

// Fungsi untuk menambahkan pesan ke chat log
function addMessageToChatLog(message, isUser = false) {
    const chatLog = document.getElementById('chat-log');
    const messageClass = isUser ? 'user-message' : 'bot-message';
    const timestamp = new Date().toLocaleTimeString();

    chatLog.innerHTML += `
        <div class="${messageClass}">
            ${!isUser ? '<img src="images/logo-bot.png" alt="Bot Logo" class="bot-logo">' : ''}
            <div>
                <p>${message}</p>
                <small>${timestamp}</small>
            </div>
        </div>
    `;
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Fungsi untuk menyimpan percakapan ke localStorage
function saveChatToLocalStorage() {
    const chatLog = document.getElementById('chat-log').innerHTML;
    localStorage.setItem('chatHistory', chatLog);
}

// Fungsi untuk memuat percakapan dari localStorage
function loadChatFromLocalStorage() {
    const savedChat = localStorage.getItem('chatHistory');
    if (savedChat) {
        document.getElementById('chat-log').innerHTML = savedChat;
    }
}

// Fungsi utama untuk menangani percakapan
function handleChat() {
    const userInput = document.getElementById('user-input').value.trim();

    if (userInput) {
        addMessageToChatLog(userInput, true); // Menambahkan pesan pengguna ke chat log

        let botResponse = '';

        // Logika percakapan bot
        if (userInput.includes('kehilangan dompet')) {
            botResponse = `
                Mohon isi formulir berikut untuk membantu kami mencatat barang Anda:
                <a href="/form.html" target="_blank">Isi Formulir</a>
            `;
        } else if (userInput.includes('adakah barang yang sesuai') || userInput.includes('barang yang hilang')) {
            botResponse = 'Baik, kami akan mencari barang yang Anda maksud terlebih dahulu.';
            addMessageToChatLog(botResponse); // Menambahkan respon pertama

            setTimeout(() => {
                botResponse = 'Apakah ini dompet Anda yang hilang?';
                botResponse += `<img src="images/dompet.jpg" alt="Dompet" class="chat-image">`; // Menambahkan gambar dompet
                addMessageToChatLog(botResponse); // Menambahkan respon kedua
            }, 2000);

        } else if (userInput.includes('iya itu dompet saya yang hilang')) {
            botResponse = 'Baik, kami akan segera mengembalikan barang Anda yang hilang. Bisakah Anda memberikan lokasi Anda?';
            addMessageToChatLog(botResponse); // Menambahkan permintaan lokasi
        } else if (userInput.includes('lokasi')) {
            sendLocation(); // Mengirimkan lokasi
            return; // Stop further processing as we are handling the location
        } else if (userInput.includes('terima kasih')) {
            botResponse = 'Sama-sama! Kami akan secepat mungkin untuk mengembalikan barang anda yang hilang.';
            
            // Menambahkan pesan terimakasih setelah "Sama-sama!"
            setTimeout(() => {
                botResponse = 'Terima kasih telah menggunakan layanan kami. Kami siap membantu Anda kapan saja!';
                addMessageToChatLog(botResponse); // Menambahkan pesan terima kasih tambahan
            }, 1000); // Delay sebelum menambahkan pesan terima kasih
        } else {
            botResponse = 'Maaf, saya tidak mengerti. Bisa dijelaskan lebih lanjut?';
        }

        addMessageToChatLog(botResponse); // Menambahkan respon bot ke chat log
        saveChatToLocalStorage(); // Menyimpan percakapan ke localStorage
        document.getElementById('user-input').value = ''; // Reset input pengguna
    }
}

// Fungsi menangani tombol "Enter"
function handleEnter(event) {
    if (event.key === 'Enter') {
        handleChat();
    }
}

// Fungsi untuk mengirimkan lokasi pengguna dan email
function sendLocation() {
    const apiKey = '9845ee464efa402297bffa38b829643e';

    // Lokasi tetap (Indonesia, Padang)
    const latitude = -0.8972451545036286;
    const longitude = 100.35071790822307;

    addMessageToChatLog('📍 Lokasi Anda sedang diproses...', true);

    fetch(`https://api.ipgeolocation.io/reverse-geocoding?apiKey=${apiKey}&lat=${latitude}&long=${longitude}`)
        .then((response) => response.json())
        .then((data) => {
            const locationMessage = `
                Lokasi Anda:
                Negara: Indonesia<br>
                Kota: Padang<br>
                Koordinat: (${latitude}, ${longitude})
            `;
            addMessageToChatLog(locationMessage);

            const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const gmapMessage = `
                Anda dapat melihat lokasi Anda di Google Maps:
                <a href="${googleMapsLink}" target="_blank">Klik di sini untuk melihat lokasi</a>
            `;
            addMessageToChatLog(gmapMessage);

            // Kirim permintaan untuk mengirim email ke server
            const userEmail = 'yudimubarok2904@gmail.com'; // Ganti dengan email pengguna
            const location = { lat: latitude, lon: longitude };

            // Mengirimkan permintaan ke server untuk mengirimkan email
            fetch('http://localhost:5000/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail, location }),
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log('Email berhasil dikirim');
                    addMessageToChatLog('📧 Email dengan lokasi Anda telah berhasil dikirim.');
                } else {
                    console.log('Gagal mengirim email:', data.message);
                    addMessageToChatLog('⚠️ Terjadi kesalahan saat mengirim email.');
                }
            })
            .catch((error) => {
                console.error('Error mengirim email:', error);
                addMessageToChatLog('⚠️ Terjadi kesalahan saat mengirim email.');
            });
        })
        .catch((error) => {
            console.error('Error fetching location:', error);
            addMessageToChatLog('⚠️ Terjadi kesalahan saat memproses lokasi.');
        });
}

// Memuat percakapan saat halaman pertama kali dibuka
window.onload = loadChatFromLocalStorage;
