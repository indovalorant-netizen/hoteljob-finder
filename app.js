// Telegram Web App initialization
let tg = window.Telegram?.WebApp;

// Initialize Telegram Web App jika ada
if (tg) {
    tg.expand(); // Expand to full screen
    tg.enableClosingConfirmation(); // Prevent accidental close
    tg.BackButton.hide(); // Sembunyikan back button untuk sekarang
} else {
    // Fallback untuk testing di browser biasa
    console.log('Running outside Telegram');
    tg = {
        showPopup: (params, callback) => {
            const result = confirm(params.message);
            callback(result ? 'apply' : 'cancel');
        },
        showAlert: (message) => alert(message),
        initDataUnsafe: { user: null }
    };
}

// Sample job data (TANPA GAJI)
const sampleJobs = [
    {
        id: 1,
        position: "Front Office Staff",
        hotel: "Hotel Grand Bali",
        location: "bali",
        type: "Full-time",
        description: "Melayani check-in/check-out tamu, handling reservation, dan memberikan service excellence kepada tamu.",
        requirements: "Pengalaman min. 1 tahun, komunikasi baik, menguasai English"
    },
    {
        id: 2,
        position: "Housekeeping Supervisor",
        hotel: "Resort Sanur Beach", 
        location: "bali",
        type: "Full-time",
        description: "Mengawasi tim housekeeping, memastikan standar kebersihan, dan training staff baru.",
        requirements: "Pengalaman min. 2 tahun di housekeeping, leadership skills"
    },
    {
        id: 3,
        position: "F&B Service",
        hotel: "Hotel Jakarta Central",
        location: "jakarta", 
        type: "Full-time",
        description: "Melayani tamu di restaurant, mengambil order, dan memastikan kepuasan tamu.",
        requirements: "Ramah, komunikatif, pengalaman F&B lebih diutamakan"
    },
    {
        id: 4,
        position: "Executive Chef",
        hotel: "Luxury Resort Ubud",
        location: "bali",
        type: "Full-time", 
        description: "Memimpin kitchen operation, menu planning, cost control, dan menjaga kualitas makanan.",
        requirements: "Pengalaman min. 5 tahun sebagai Chef, certified culinary education"
    }
];

// Display jobs
function displayJobs(jobs) {
    const jobsList = document.getElementById('jobsList');
    const loading = document.getElementById('loading');
    
    if (loading) loading.style.display = 'none';
    
    if (jobs.length === 0) {
        jobsList.innerHTML = '<div class="job-card">🔍 Tidak ada lowongan ditemukan</div>';
        return;
    }
    
    jobsList.innerHTML = jobs.map(job => `
        <div class="job-card" onclick="showJobDetails(${job.id})">
            <div class="job-title">${job.position}</div>
            <div class="job-meta">
                🏨 ${job.hotel}<br>
                📍 ${formatLocation(job.location)} • ${job.type}
            </div>
            <button class="apply-btn" onclick="event.stopPropagation(); applyJob(${job.id})">
                📨 Lamar Sekarang
            </button>
        </div>
    `).join('');
}

// Format location
function formatLocation(loc) {
    const locations = {
        'bali': 'Bali',
        'jakarta': 'Jakarta', 
        'surabaya': 'Surabaya'
    };
    return locations[loc] || loc;
}

// Show job details
function showJobDetails(jobId) {
    const job = sampleJobs.find(j => j.id === jobId);
    
    const detailsHTML = `
        <div class="job-details">
            <div class="job-title">${job.position}</div>
            <div class="job-meta">
                🏨 ${job.hotel}<br>
                📍 ${formatLocation(job.location)} • ${job.type}
            </div>
            
            <div class="job-section">
                <strong>📝 Deskripsi Pekerjaan:</strong>
                <p>${job.description}</p>
            </div>
            
            <div class="job-section">
                <strong>✅ Kualifikasi:</strong>
                <p>${job.requirements}</p>
            </div>
            
            <button class="apply-btn-large" onclick="applyJob(${job.id})">
                📨 Lamar Posisi Ini
            </button>
            <button class="back-btn" onclick="showJobList()">
                ← Kembali ke Daftar
            </button>
        </div>
    `;
    
    document.getElementById('jobsList').innerHTML = detailsHTML;
    if (tg?.BackButton) {
        tg.BackButton.show();
        tg.BackButton.onClick(showJobList);
    }
}

// Show job list
function showJobList() {
    displayJobs(sampleJobs);
    if (tg?.BackButton) {
        tg.BackButton.hide();
    }
}

// Apply job function
function applyJob(jobId) {
    const job = sampleJobs.find(j => j.id === jobId);
    
    if (tg?.initDataUnsafe?.user) {
        // User is logged in via Telegram
        const user = tg.initDataUnsafe.user;
        const userName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        
        tg.showPopup({
            title: 'Konfirmasi Lamaran',
            message: `Lamar sebagai ${job.position} di ${job.hotel}?`,
            buttons: [
                {id: 'cancel', type: 'cancel'},
                {id: 'apply', type: 'default', text: '✅ Ya, Lamar!'}
            ]
        }, (buttonId) => {
            if (buttonId === 'apply') {
                sendApplication(jobId, user);
                tg.showAlert(`🎉 Lamaran berhasil dikirim!\n\nPosisi: ${job.position}\nHotel: ${job.hotel}\n\nHRD akan menghubungi via Telegram dalam 1x24 jam.`);
            }
        });
    } else {
        // Fallback untuk browser
        const confirmApply = confirm(`Lamar sebagai ${job.position} di ${job.hotel}?`);
        if (confirmApply) {
            sendApplication(jobId, { first_name: 'Test User', username: 'test_user' });
            alert('Lamaran berhasil dikirim! (Testing mode)');
        }
    }
}

// Send application to backend
function sendApplication(jobId, user) {
    const job = sampleJobs.find(j => j.id === jobId);
    
    // Simpan di localStorage untuk sementara
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const newApplication = {
        jobId: jobId,
        position: job.position,
        hotel: job.hotel,
        userId: user.id || 'unknown',
        userName: user.first_name || 'User',
        userUsername: user.username || 'No username',
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    applications.push(newApplication);
    localStorage.setItem('applications', JSON.stringify(applications));
    
    // Log untuk debugging
    console.log('📨 Application submitted:', newApplication);
    
    // TODO: nanti ganti dengan API call ke backend GCP
    // fetch('https://your-gcp-backend/api/apply', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(newApplication)
    // });
}

// Filter jobs
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const locationFilter = document.getElementById('locationFilter');
    
    function filterJobs() {
        const searchTerm = searchInput.value.toLowerCase();
        const location = locationFilter.value;
        
        const filtered = sampleJobs.filter(job => {
            const matchSearch = job.position.toLowerCase().includes(searchTerm) || 
                              job.hotel.toLowerCase().includes(searchTerm);
            const matchLocation = !location || job.location === location;
            
            return matchSearch && matchLocation;
        });
        
        displayJobs(filtered);
    }
    
    if (searchInput) searchInput.addEventListener('input', filterJobs);
    if (locationFilter) locationFilter.addEventListener('change', filterJobs);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    displayJobs(sampleJobs);
    setupFilters();
    
    // Welcome message
    setTimeout(() => {
        if (tg?.initDataUnsafe?.user) {
            const user = tg.initDataUnsafe.user;
            tg.showPopup({
                title: 'Selamat Datang! 👋',
                message: `Hai ${user.first_name}! Temukan lowongan perhotelan terbaik dan lamar dengan 1 klik.`,
                buttons: [{id: 'ok', type: 'default', text: 'Mulai Jelajah 🚀'}]
            });
        }
    }, 1500);
});
