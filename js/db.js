const mongoose = require('mongoose');

// Funkcja łącząca aplikację z bazą danych MongoDB
const connectDB = async () => {
    try {
        // Nawiązywanie połączenia z lokalną bazą MongoDB
        await mongoose.connect('mongodb://localhost:27017/pwa_auth', {
            useNewUrlParser: true,     // Użycie nowego parsera URL
            useUnifiedTopology: true   // Użycie nowego silnika zarządzania połączeniem
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        // Obsługa błędów połączenia
        console.error('MongoDB connection error:', error);
        process.exit(1);  // Zakończenie procesu w przypadku błędu połączenia
    }
};

module.exports = connectDB;