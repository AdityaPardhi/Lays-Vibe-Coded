/* ═══════════════════════════════════════════════════════════════════════════
   ORDER.JS — Order tracking page
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (orderId) {
        loadOrder(orderId);
    }

    document.getElementById('lookupBtn')?.addEventListener('click', () => {
        const val = document.getElementById('lookupInput').value.trim();
        if (val) loadOrder(val);
    });
});

function loadOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('lays_orders') || '[]');
    const order = orders.find(o => o.orderId === orderId);

    if (!order) {
        document.getElementById('noOrder').style.display = 'flex';
        document.getElementById('orderCard').style.display = 'none';
        showToast('Order not found. Please check the ID.');
        return;
    }

    document.getElementById('noOrder').style.display = 'none';
    document.getElementById('orderCard').style.display = 'block';

    document.getElementById('trackOrderId').textContent = order.orderId;

    // Simulate status progression based on time since order
    const elapsed = (Date.now() - new Date(order.date).getTime()) / 1000; // seconds
    let statusStep = 0;
    if (elapsed > 5)  statusStep = 1;  // "Preparing"
    if (elapsed > 15) statusStep = 2;  // "Out for Delivery"
    if (elapsed > 30) statusStep = 3;  // "Delivered"

    const statusLabels = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
    document.getElementById('trackStatusBadge').textContent = statusLabels[statusStep];

    // Update progress steps
    for (let i = 0; i <= 3; i++) {
        const el = document.querySelector(`.progress-step[data-s="${i}"]`);
        if (!el) continue;
        if (i < statusStep)       { el.classList.add('done'); el.classList.remove('active'); }
        else if (i === statusStep){ el.classList.add('active'); el.classList.remove('done'); }
        else                      { el.classList.remove('done', 'active'); }
    }

    // Progress lines
    document.querySelectorAll('.progress-line').forEach((line, i) => {
        line.classList.toggle('active', i < statusStep);
    });

    // Order Info Grid
    const paymentLabels = { card: 'Credit/Debit Card', upi: 'UPI', cod: 'Cash on Delivery' };
    const infoGrid = document.getElementById('orderInfoGrid');
    if (infoGrid) {
        infoGrid.innerHTML = `
            <div class="info-cell">
                <span>Customer</span>
                <strong>${order.firstName} ${order.lastName}</strong>
            </div>
            <div class="info-cell">
                <span>Delivery Address</span>
                <strong>${order.address}, ${order.city} - ${order.pincode}</strong>
            </div>
            <div class="info-cell">
                <span>Payment</span>
                <strong>${paymentLabels[order.paymentMethod] || 'N/A'}</strong>
            </div>
            <div class="info-cell">
                <span>Order Total</span>
                <strong class="text-gradient">₹${order.grandTotal}</strong>
            </div>
        `;
    }

    // Items list
    const itemsList = document.getElementById('trackItemsList');
    if (itemsList && order.items) {
        itemsList.innerHTML = order.items.map(item => `
            <div class="track-item">
                <div class="track-item-dot" style="background:${item.color}"></div>
                <div class="track-item-info">
                    <strong>${item.name}</strong>
                    <span>${item.size} (${item.weight}) × ${item.qty}</span>
                </div>
                <span class="track-item-price">₹${item.price * item.qty}</span>
            </div>
        `).join('');
    }
}
