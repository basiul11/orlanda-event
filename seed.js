require('dotenv').config();
const mongoose = require('mongoose');

const initialGuests = [
    { qrCode: "ORLANDA-001-XYZ", guestName: "أحمد محمد علي" },
    { qrCode: "ORLANDA-002-ABC", guestName: "فاطمة الزهراء" },
    { qrCode: "ORLANDA-003-QWE", guestName: "سارة إبراهيم" },
    { qrCode: "ORLANDA-VIP-777", guestName: "محمد عبد المنعم (VIP)" },
    { qrCode: "ORLANDA-11", guestName: "BASIL" }
];

const GuestSchema = new mongoose.Schema({
    qrCode: { type: String, required: true, unique: true, uppercase: true },
    guestName: { type: String, required: true },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date }
});

const Guest = mongoose.model('Guest', GuestSchema);

const seedDB = async () => {
    await mongoose.connect(process.env.MONGO_URI); // No options needed here either
    console.log('MongoDB Connected for seeding...');

    // Clear existing guests to avoid duplicates on re-run
    await Guest.deleteMany({});
    console.log('Cleared existing guests.');

    // Insert new guests
    await Guest.insertMany(initialGuests);
    console.log('Initial guests have been added!');

    mongoose.connection.close();
};

seedDB().catch(err => {
    console.error('Seeding error:', err);
    mongoose.connection.close();
});