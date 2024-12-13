// Klasa obsługująca autentykację użytkowników
class AuthService {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.initializeListeners();
    }

    // Inicjalizacja nasłuchiwania zdarzeń formularzy
    initializeListeners() {
        document.getElementById('login').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register').addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Obsługa logowania użytkownika
    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            // Wysłanie żądania logowania do API
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                // Zapisanie tokena i ID użytkownika w localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                window.location.href = '/dashboard.html';
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            this.showError('Błąd podczas logowania');
        }
    }

    // Obsługa rejestracji nowego użytkownika
    async handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const passwords = form.querySelectorAll('input[type="password"]');

        // Sprawdzenie zgodności haseł
        if (passwords[0].value !== passwords[1].value) {
            this.showError('Hasła nie są identyczne');
            return;
        }

        try {
            // Wysłanie żądania rejestracji do API
            const response = await fetch(`${this.apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password: passwords[0].value
                })
            });

            const data = await response.json();
            if (response.ok) {
                this.showSuccess('Rejestracja udana! Możesz się zalogować');
                toggleForms();
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            this.showError('Błąd podczas rejestracji');
        }
    }

    // Wyświetlanie komunikatów o błędach
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.app-container').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Wyświetlanie komunikatów o sukcesie
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        document.querySelector('.app-container').prepend(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }

    // Przekierowanie do panelu użytkownika
    redirectToDashboard() {
        window.location.href = '/dashboard.html';
    }
}

// Inicjalizacja serwisu autentykacji
const authService = new AuthService();

// Ustawienie akcji formularza logowania
document.getElementById('loginForm').action = '/dashboard.html';

