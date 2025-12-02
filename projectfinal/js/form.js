// === FORM.JS - SCRIPT UNTUK EVENT-FORM.HTML ===

let editMode = false;
let editEventId = null;

document.addEventListener('DOMContentLoaded', function() {
    checkEditMode();
    setupForm();
});

// Cek apakah mode edit (ada parameter ID di URL)
function checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (eventId) {
        editMode = true;
        editEventId = eventId;
        loadEventData(eventId);
        
        // Ubah judul form
        const formTitle = document.getElementById('formTitle');
        if (formTitle) {
            formTitle.textContent = 'Edit Event';
        }

        // Ubah teks tombol submit
        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.innerHTML = '✏️ Update Event';
        }
    }
}

// Memuat data event untuk mode edit
function loadEventData(eventId) {
    const event = StorageManager.getEventById(eventId);
    
    if (!event) {
        alert('Event tidak ditemukan!');
        window.location.href = 'dashboard.html';
        return;
    }

    // Isi form dengan data event
    document.getElementById('title').value = event.title;
    document.getElementById('date').value = event.date;
    document.getElementById('location').value = event.location;
    document.getElementById('category').value = event.category;
    document.getElementById('price').value = event.price;
    document.getElementById('image').value = event.image || '';
    document.getElementById('description').value = event.description;
}

// Setup event listener untuk form
function setupForm() {
    const form = document.getElementById('eventForm');
    
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validasi form
        if (!validateForm()) {
            return;
        }

        // Ambil data dari form
        const formData = {
            title: document.getElementById('title').value.trim(),
            date: document.getElementById('date').value,
            location: document.getElementById('location').value.trim(),
            category: document.getElementById('category').value,
            price: document.getElementById('price').value,
            image: document.getElementById('image').value.trim(),
            description: document.getElementById('description').value.trim()
        };

        // Simpan data
        if (editMode) {
            updateEvent(formData);
        } else {
            createEvent(formData);
        }
    });
}

// Validasi form
function validateForm() {
    const title = document.getElementById('title').value.trim();
    const date = document.getElementById('date').value;
    const location = document.getElementById('location').value.trim();
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value.trim();

    // Validasi field wajib
    if (!title) {
        alert('❌ Judul event harus diisi!');
        document.getElementById('title').focus();
        return false;
    }

    if (!date) {
        alert('❌ Tanggal event harus diisi!');
        document.getElementById('date').focus();
        return false;
    }

    if (!location) {
        alert('❌ Lokasi event harus diisi!');
        document.getElementById('location').focus();
        return false;
    }

    if (!category) {
        alert('❌ Kategori event harus dipilih!');
        document.getElementById('category').focus();
        return false;
    }

    if (!price || isNaN(price) || parseInt(price) < 0) {
        alert('❌ Harga tiket harus berupa angka valid (minimal 0)!');
        document.getElementById('price').focus();
        return false;
    }

    if (!description) {
        alert('❌ Deskripsi event harus diisi!');
        document.getElementById('description').focus();
        return false;
    }

    // Validasi tanggal tidak boleh di masa lalu
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        const confirm = window.confirm('⚠️ Tanggal event sudah lewat. Apakah Anda yakin ingin melanjutkan?');
        if (!confirm) {
            return false;
        }
    }

    return true;
}

// Membuat event baru
function createEvent(formData) {
    try {
        StorageManager.addEvent(formData);
        alert('✅ Event berhasil ditambahkan!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert('❌ Gagal menambahkan event: ' + error.message);
    }
}

// Update event yang sudah ada
function updateEvent(formData) {
    try {
        StorageManager.updateEvent(editEventId, formData);
        alert('✅ Event berhasil diupdate!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert('❌ Gagal mengupdate event: ' + error.message);
    }
}