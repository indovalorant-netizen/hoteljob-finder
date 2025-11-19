// Telegram Web App initialization
const tg = window.Telegram.WebApp;
tg.expand(); // Expand to full screen
tg.enableClosingConfirmation(); // Prevent accidental close

// Sample job data (TANPA GAJI)
const sampleJobs = [
    {
        id: 1,
        position: "Front Office Staff",
        hotel: "Hotel Grand Bali",
        location: "bali",
        type: "Full-time"
    },
    {
        id: 2,
        position: "Housekeeping Supervisor",
        hotel: "Resort Sanur Beach",
        location: "bali",
        type: "Full-time"
    },
    {
        id: 3,
        position: "F&B Service",
        hotel: "Hotel Jakarta Central",
        location: "jakarta",
        type: "Full-time"
    },
    {
        id: 4,
        position: "Executive Chef",
        hotel: "Luxury Resort Ubud",
        location: "bali", 
        type: "Full-time"
    },
    {
        id: 5,
        position: "Bellboy",
        hotel: "Hotel Surabaya Plaza",
        location: "surabaya",
        type: "Full-time"
    },
    {
        id: 6,
        position: "Receptionist",
        hotel: "Boutique Hotel Seminyak",
        location: "bali",
        type: "Part-time"
    }
];

// Display jobs
function displayJobs(jobs) {
    const jobsList = document.getElementById('jobsList');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'none';
    
    if (jobs.length === 0) {
        jobsList.innerHTML = '<div class="job-card">Tidak ada lowongan ditemukan</div>';
        return;
    }
    
    jobsList.innerHTML = jobs.map(job => `
        <div class="job-card">
            <div class="job-title">${job.position}</div>
            <div class="job-meta">
                🏨 ${job.hotel}<br>
                📍 ${job.location.charAt(0).toUpperCase() + job.location.slice(1)} • ${job.type}
            </div>
            <button class="apply-btn" onclick="applyJob(${job.id})">
                Lamar Sekarang
            </button>
        </div>
    `).join('');
}

// Apply job function
function applyJob(jobId) {
    const job = sampleJobs.find(j => j.id === jobId);
    
    if (tg.initDataUnsafe.user) {
        // User is logged in via Telegram
        const user = tg.initDataUnsafe.user;
        
        // Show confirmation
        tg.showPopup({
            title: 'Konfirmasi Lamaran',
            message: `Lamar sebagai ${job.position} di ${job.hotel}?`,
            buttons: [
                {id: 'cancel', type: 'cancel'},
                {id: 'apply', type: 'default', text: 'Ya, Lamar!'}
            ]
        }, (buttonId) => {
            if (buttonId === 'apply') {
                // Send application data to backend
                sendApplication(jobId, user);
                tg.showAlert(`✅ Lamaran untuk ${job.position} berhasil dikirim! HRD akan menghubungi Anda via Telegram.`);
            }
        });
    } else {
        // User not logged in - should not happen in Mini App
        tg.showAlert('Silakan buka aplikasi ini melalui Telegram untuk melamar.');
    }
}

// Send application to backend
function sendApplication(jobId, user) {
    const job = sampleJobs.find(j => j.id === jobId);
    
    // Simpan di localStorage untuk sementara
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push({
        jobId: jobId,
        position: job.position,
        hotel: job.hotel,
        userId: user.id,
        userName: user.first_name || 'User',
        userUsername: user.username || 'No username',
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('applications', JSON.stringify(applications));
    
    // Log untuk debugging (nanti ganti dengan API call ke GCP)
    console.log('Application submitted:', {
        jobId: jobId,
        position: job.position,
        user: user.first_name,
        username: user.username
    });
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
    
    searchInput.addEventListener('input', filterJobs);
    locationFilter.addEventListener('change', filterJobs);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    displayJobs(sampleJobs);
    setupFilters();
    
    // Optional: Tampilkan welcome message
    setTimeout(() => {
        if (tg.initDataUnsafe.user) {
            const user = tg.initDataUnsafe.user;
            tg.showPopup({
                title: 'Selamat Datang!',
                message: `Hai ${user.first_name}! 👋 Temukan lowongan perhotelan terbaik di sini.`,
                buttons: [{id: 'ok', type: 'default', text: 'Mulai Jelajah'}]
            });
        }
    }, 1000);
});
