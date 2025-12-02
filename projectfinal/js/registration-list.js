// === REGISTRATIONS-LIST.JS - SCRIPT UNTUK REGISTRATIONS.HTML ===

document.addEventListener('DOMContentLoaded', function() {
    loadRegistrations();
    updateStatistics();
});

// Ambil semua pendaftaran dari localStorage
function getRegistrations() {
    const data = localStorage.getItem('devent_registrations');
    return data ? JSON.parse(data) : [];
}

// Load semua pendaftaran
function loadRegistrations() {
    const registrations = getRegistrations();
    const tbody = document.getElementById('registrationsBody');
    const emptyState = document.getElementById('emptyState');
    const tableWrapper = document.querySelector('.registrations-container');

    if (registrations.length === 0) {
        if (tableWrapper) tableWrapper.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (tableWrapper) tableWrapper.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    // Urutkan dari yang terbaru
    registrations.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));

    tbody.innerHTML = registrations.map(reg => createTableRow(reg)).join('');
}

// Buat baris tabel
function createTableRow(registration) {
    return `
        <tr>
            <td><strong>#${registration.registrationId}</strong></td>
            <td>${registration.fullName}</td>
            <td>${registration.eventTitle}</td>
            <td>${registration.email}</td>
            <td>${registration.phone}</td>
            <td>${registration.ticketQty}</td>
            <td><strong>Rp ${formatPrice(registration.totalPrice)}</strong></td>
            <td>${formatDateTime(registration.registrationDate)}</td>
            <td>
                <button onclick="viewDetail('${registration.registrationId}')" class="btn-view-small">
                    Detail
                </button>
                <button onclick="deleteRegistration('${registration.registrationId}')" class="btn-delete-small">
                    Hapus
                </button>
            </td>
        </tr>
    `;
}

// Update statistik
function updateStatistics() {
    const registrations = getRegistrations();
    
    const totalRegistrations = registrations.length;
    const totalTickets = registrations.reduce((sum, reg) => sum + reg.ticketQty, 0);
    const totalRevenue = registrations.reduce((sum, reg) => sum + reg.totalPrice, 0);

    document.getElementById('totalRegistrations').textContent = totalRegistrations;
    document.getElementById('totalTickets').textContent = totalTickets;
    document.getElementById('totalRevenue').textContent = `Rp ${formatPrice(totalRevenue)}`;
}

// Lihat detail pendaftaran
function viewDetail(registrationId) {
    const registrations = getRegistrations();
    const registration = registrations.find(reg => reg.registrationId == registrationId);

    if (!registration) {
        alert('Pendaftaran tidak ditemukan!');
        return;
    }

    const message = `
📋 DETAIL PENDAFTARAN

ID: #${registration.registrationId}
Event: ${registration.eventTitle}

👤 Data Peserta:
Nama: ${registration.fullName}
Email: ${registration.email}
Telepon: ${registration.phone}
Alamat: ${registration.address}

🎫 Informasi Tiket:
Jumlah Tiket: ${registration.ticketQty}
Total Pembayaran: Rp ${formatPrice(registration.totalPrice)}

📅 Tanggal Pendaftaran:
${formatDateTime(registration.registrationDate)}

${registration.notes ? `📝 Catatan:\n${registration.notes}` : ''}
    `;

    alert(message);
}

// Hapus pendaftaran
function deleteRegistration(registrationId) {
    const registrations = getRegistrations();
    const registration = registrations.find(reg => reg.registrationId == registrationId);

    if (!registration) {
        alert('Registration not found!');
        return;
    }

    const confirmDelete = confirm(
        `⚠️ Are you sure you want to delete this registration?\n\nName: ${registration.fullName}\nEvent: ${registration.eventTitle}\n\nThis action cannot be undone!`
    );

    if (confirmDelete) {
        StorageManager.deleteRegistration(registrationId);

        alert('✅ Registration successfully deleted!');
        loadRegistrations();
        updateStatistics();
    }
}

// Format harga
function formatPrice(price) {
    return parseInt(price).toLocaleString('id-ID');
}

// Format tanggal dan waktu
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}