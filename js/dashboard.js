// Klasa zarządzająca funkcjonalnością panelu administracyjnego
class Dashboard {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.init();
        this.setupLogout();
        this.setupTransactionForm();
    }

    // Inicjalizacja podstawowych funkcji dashboardu
    async init() {
        this.checkAuth();
        await this.loadUserData();
        await this.updateDashboardData();
    }

    // Sprawdzenie czy użytkownik jest zalogowany
    checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/index.html';
        }
    }

    // Pobieranie i wyświetlanie danych zalogowanego użytkownika
    async loadUserData() {
        try {
            const userId = localStorage.getItem('userId');
            const response = await fetch(`${this.apiUrl}/user/${userId}`);
            const userData = await response.json();
            
            // Aktualizacja widoku danymi użytkownika
            const userDataDiv = document.getElementById('userData');
            userDataDiv.innerHTML = `
                <p><strong>Imię:</strong> ${userData.name}</p>
                <p><strong>Email:</strong> ${userData.email}</p>
                <p><strong>Dołączył:</strong> ${new Date(userData.createdAt).toLocaleDateString()}</p>
            `;
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Konfiguracja funkcji wylogowania
    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/index.html';
        });
    }
    
    setupTransactionForm() {
        const form = document.getElementById('addTransactionForm');
        form.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
    }

    async handleTransactionSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const transaction = {
            date: formData.get('date'),
            type: formData.get('type'),
            category: formData.get('category'),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description'),
            userId: localStorage.getItem('userId')
        };

        try {
            const response = await fetch(`${this.apiUrl}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(transaction)
            });

            if (response.ok) {
                await this.updateDashboardData();
                e.target.reset();
                // Close modal if you have one
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    }

    async updateDashboardData() {
        const userId = localStorage.getItem('userId');
        try {
            const response = await fetch(`${this.apiUrl}/transactions/${userId}`);
            const transactions = await response.json();
            
            // Calculate totals
            let totalIncome = 0;
            let totalExpenses = 0;
            
            transactions.forEach(transaction => {
                if (transaction.type === 'income') {
                    totalIncome += transaction.amount;
                } else {
                    totalExpenses += transaction.amount;
                }
            });

            const balance = totalIncome - totalExpenses;

            // Update UI
            document.getElementById('totalBalance').textContent = `${balance.toFixed(2)} PLN`;
            document.getElementById('totalIncome').textContent = `${totalIncome.toFixed(2)} PLN`;
            document.getElementById('totalExpenses').textContent = `${totalExpenses.toFixed(2)} PLN`;
            
            // Update transactions list
            this.updateTransactionsList(transactions);
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    updateTransactionsList(transactions) {
        const listElement = document.getElementById('transactionsList');
        listElement.innerHTML = transactions.map(transaction => `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</div>
                <div class="transaction-category">${transaction.category}</div>
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-amount">${transaction.amount.toFixed(2)} PLN</div>
            </div>
        `).join('');
    }
}

// Inicjalizacja dashboardu po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
});