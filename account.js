/* ═══════════════════════════════════════════════════════════════════════════
   ACCOUNT.JS — Auth (login/register) + Account dashboard
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    setupAuthForms();
    setupProfileForm();
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
});

// ── Auth State ──────────────────────────────────────────────────────────
function checkAuthState() {
    const user = getCurrentUser();
    if (user) {
        showDashboard(user);
    } else {
        document.getElementById('authPage').style.display = 'flex';
        document.getElementById('accountPage').style.display = 'none';
    }
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('lays_user') || 'null');
}

function showDashboard(user) {
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('accountPage').style.display = 'block';

    // Avatar
    document.getElementById('avatarCircle').textContent = user.firstName[0].toUpperCase();
    document.getElementById('accountName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('accountEmail').textContent = user.email;

    // Profile form
    document.getElementById('profileFirst').value = user.firstName;
    document.getElementById('profileLast').value = user.lastName;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profilePhone').value = user.phone || '';

    renderOrderHistory();
}

// ── Auth Forms ──────────────────────────────────────────────────────────
function setupAuthForms() {
    // Login
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const users = JSON.parse(localStorage.getItem('lays_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('lays_user', JSON.stringify(user));
            showToast('Welcome back, ' + user.firstName + '! 🎉');
            setTimeout(() => showDashboard(user), 500);
        } else {
            showToast('Invalid email or password.');
        }
    });

    // Register
    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('regFirst').value;
        const lastName = document.getElementById('regLast').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        if (password.length < 6) {
            showToast('Password must be at least 6 characters.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('lays_users') || '[]');
        const exists = users.find(u => u.email === email);

        if (exists) {
            showToast('This email is already registered. Please sign in.');
            return;
        }

        const newUser = { firstName, lastName, email, password, createdAt: new Date().toISOString() };
        users.push(newUser);
        localStorage.setItem('lays_users', JSON.stringify(users));
        localStorage.setItem('lays_user', JSON.stringify(newUser));

        showToast('Account created! Welcome, ' + firstName + '! 🎉');
        setTimeout(() => showDashboard(newUser), 500);
    });
}

function logout() {
    localStorage.removeItem('lays_user');
    showToast('Signed out. See you soon! 👋');
    setTimeout(() => {
        document.getElementById('accountPage').style.display = 'none';
        document.getElementById('authPage').style.display = 'flex';
        switchTab('login');
    }, 600);
}

// ── Tab Switch (Login / Register) ───────────────────────────────────────
function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

    document.getElementById(tab === 'login' ? 'loginTab' : 'registerTab').classList.add('active');
    document.getElementById(tab === 'login' ? 'loginForm' : 'registerForm').classList.add('active');
}

// ── Account Dashboard Tabs ──────────────────────────────────────────────
function showTab(tab) {
    document.querySelectorAll('.account-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.account-nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    document.getElementById('nav' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
}

// ── Order History ───────────────────────────────────────────────────────
function renderOrderHistory() {
    const container = document.getElementById('orderHistoryList');
    if (!container) return;

    const orders = JSON.parse(localStorage.getItem('lays_orders') || '[]');

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                <div style="font-size:3rem;">🛍️</div>
                <p>No orders yet!</p>
                <a href="shop.html" class="btn-gradient" style="margin-top:1rem;">Start Shopping</a>
            </div>`;
        return;
    }

    container.innerHTML = orders.reverse().map(order => {
        const date = new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const itemCount = order.items ? order.items.reduce((s, i) => s + i.qty, 0) : 0;
        return `
            <div class="order-history-card">
                <div class="ohc-header">
                    <div>
                        <span class="ohc-id">${order.orderId}</span>
                        <span class="ohc-date">${date}</span>
                    </div>
                    <span class="ohc-status">Confirmed</span>
                </div>
                <div class="ohc-body">
                    <span>${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
                    <strong class="ohc-total">₹${order.grandTotal}</strong>
                </div>
                <div class="ohc-footer">
                    <a href="order.html?id=${order.orderId}" class="btn-outline btn-sm">Track Order &rarr;</a>
                    <a href="shop.html" class="btn-gradient btn-sm">Reorder</a>
                </div>
            </div>`;
    }).join('');
}

// ── Profile Update ──────────────────────────────────────────────────────
function setupProfileForm() {
    document.getElementById('profileForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        if (!user) return;

        user.firstName = document.getElementById('profileFirst').value;
        user.lastName = document.getElementById('profileLast').value;
        user.phone = document.getElementById('profilePhone').value;

        localStorage.setItem('lays_user', JSON.stringify(user));

        // Update users array
        const users = JSON.parse(localStorage.getItem('lays_users') || '[]');
        const idx = users.findIndex(u => u.email === user.email);
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...user };
            localStorage.setItem('lays_users', JSON.stringify(users));
        }

        document.getElementById('accountName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('avatarCircle').textContent = user.firstName[0].toUpperCase();
        showToast('Profile updated successfully! ✅');
    });
}
