// Telegram Web App initialization
const tg = window.Telegram.WebApp;
tg.expand(); // Expand to full screen
tg.enableClosingConfirmation(); // Prevent accidental close

// Sample job data (nanti ganti dengan API dari GCP)
const sampleJobs = [
    {
        id: 1,
        position: "Front Office Staff",
        hotel: "Hotel Grand Bali",
        location: "Bali",
        salary: "Rp 4.5 - 5.5 juta",
        type: "Full-time"
    },
    {
        id: 2,
        position: "Housekeeping Supervisor",
        hotel: "Resort Sanur Beach",
        location: "Bali", 
        salary: "Rp 5 - 6 juta",
        type: "Full-time"
    },
    {
        id: 3,
        position: "F&B Service",
        hotel: "Hotel Jakarta Central",
        location: "Jakarta",
        salary: "Rp 4 - 5 juta",
        type: "Full-time"
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
                📍 ${job.location} • ${job.type}<br>
                💰 ${job.salary}
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
                tg.showAlert(`Lamaran untuk ${job.position} berhasil dikirim!`);
            }
        });
    } else {
        // User not logged in
        tg.showAlert('Silakan buka aplikasi ini melalui Telegram untuk melamar.');
    }
}

// Send application to backend
function sendApplication(jobId, user) {
    // Ini nanti akan connect ke backend GCP Anda
    console.log('Application sent:', {
        jobId: jobId,
        userId: user.id,
        userName: user.first_name,
        userUsername: user.username
    });
    
    // Simpan di localStorage untuk sementara
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push({
        jobId: jobId,
        userId: user.id,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('applications', JSON.stringify(applications));
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
            const matchLocation = !location || job.location.toLowerCase() === location;
            
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
});
