const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definicja schematu użytkownika
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true    
    },
    email: {
        type: String,
        required: true,   
        unique: true      
    },
    password: {
        type: String,
        required: true    
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Haszowanie hasła przed zapisem do bazy danych
userSchema.pre('save', async function(next) {
    // Sprawdzenie czy hasło zostało zmodyfikowane
    if (!this.isModified('password')) {
        return next();
    }
    // Generowanie soli i haszowanie hasła
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Metoda do porównywania haseł podczas logowania
userSchema.methods.comparePassword = async function(candidatePassword) {
    // Porównanie podanego hasła z zahaszowanym hasłem w bazie
    return await bcrypt.compare(candidatePassword, this.password);
};

// Utworzenie modelu User na podstawie schematu
const User = mongoose.model('User', userSchema);
module.exports = User;
