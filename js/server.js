// Importowanie wymaganych modułów
const express = require('express');  // Framework do tworzenia aplikacji webowych
const cors = require('cors');        // Middleware do obsługi Cross-Origin Resource Sharing
const connectDB = require('./db');   // Funkcja łącząca z bazą danych
const User = require('./user.js'); // Model użytkownika
const Transaction = require('./transaction.js'); // Model transakcji
const dotenv = require('dotenv');    // Moduł do obsługi zmiennych środowiskowych

// Wczytanie zmiennych środowiskowych z pliku .env
dotenv.config();

// Utworzenie instancji aplikacji Express
const app = express();

// Połączenie z bazą danych MongoDB
connectDB();

// Konfiguracja middleware
app.use(cors());           // Włączenie obsługi CORS
app.use(express.json());   // Parsowanie danych JSON w żądaniach

// Trasa testowa do sprawdzenia działania API
app.get('/api', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Trasy (endpoints) API

// Rejestracja nowego użytkownika
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Sprawdzenie czy użytkownik już istnieje
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Utworzenie nowego użytkownika
        user = new User({
            name,
            email,
            password
        });

        // Zapisanie użytkownika w bazie danych
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logowanie użytkownika
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Sprawdzenie czy użytkownik istnieje
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Weryfikacja hasła
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Zwrócenie potwierdzenia logowania
        res.json({ message: 'Login successful', userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Konfiguracja portu serwera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Pobranie danych pojedynczego użytkownika
app.get('/api/user/:id', async (req, res) => {
    try {
        // Wyszukanie użytkownika po ID (bez zwracania hasła)
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Pobranie listy wszystkich użytkowników
app.get('/api/users', async (req, res) => {
    try {
        // Pobranie wszystkich użytkowników (bez haseł)
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


app.post('/api/transactions', async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error saving transaction' });
    }
});

app.get('/api/transactions/:userId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId })
            .sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

