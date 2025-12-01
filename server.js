require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- CORS Configuration ---
// Allow requests only from your Netlify frontend
const corsOptions = {
    origin: 'https://playful-marigold-b12cce.netlify.app'
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());


// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB Connected!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Guest Schema and Model ---
const GuestSchema = new mongoose.Schema({
    qrCode: { type: String, required: true, unique: true, uppercase: true },
    guestName: { type: String, required: true },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date }
});

const Guest = mongoose.model('Guest', GuestSchema);

// --- API Routes ---

// 1. Check-in a guest
app.post('/api/checkin', async (req, res) => {
    const { qrCode } = req.body;

    if (!qrCode) {
        return res.status(400).json({ message: 'QR Code is required.' });
    }

    try {
        const guest = await Guest.findOne({ qrCode: qrCode.toUpperCase() });

        if (!guest) {
            return res.status(404).json({ message: 'كود الدعوة غير صالح أو غير مسجل!' });
        }

        if (guest.checkedIn) {
            return res.status(409).json({ message: `هذه الدعوة تم استخدامها بالفعل! (${guest.guestName})` });
        }

        // Mark as checked in
        guest.checkedIn = true;
        guest.checkedInAt = new Date();
        await guest.save();

        res.status(200).json({ guestName: guest.guestName });

    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: 'حدث خطأ في الخادم.' });
    }
});

// 2. Get all checked-in guests
app.get('/api/checked-in-guests', async (req, res) => {
    try {
        const checkedInGuests = await Guest.find({ checkedIn: true }).sort({ checkedInAt: -1 });
        const guestNames = checkedInGuests.map(g => g.guestName);
        res.status(200).json(guestNames);
    } catch (error) {
        console.error('Fetch checked-in guests error:', error);
        res.status(500).json({ message: 'حدث خطأ في الخادم.' });
    }
});

// --- Serve Static Files and Frontend ---

// Serve static files (like CSS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});