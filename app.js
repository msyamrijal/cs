const API_URL = 'https://script.google.com/macros/s/AKfycby9sPywic_2ifeYBzE3dQMHfrwkR4-fQv-bNx74HMduvcq5Rr4r9MY6GGEYNqI44WRI/exec';
let allSchedules = [];

// Theme Management
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if(savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        modeIcon.textContent = 'light_mode';
    }
};

const toggleTheme = () => {
    const overlay = document.querySelector('.overlay');
    const body = document.body;
    
    if(body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        modeIcon.textContent = 'dark_mode';
        setTimeout(() => overlay.style.transform = 'translate(50%, -50%) scale(0)', 50);
    } else {
        overlay.style.transform = 'translate(50%, -50%) scale(100)';
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        modeIcon.textContent = 'light_mode';
    }
};

// DOM Elements
const modeIcon = document.getElementById('modeIcon');
const searchInput = document.getElementById('searchInput');
const filterNav = document.getElementById('filterNav');
const scheduleGrid = document.getElementById('scheduleGrid');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');

// Data Handling
const fetchData = async () => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        allSchedules = data
            .filter(item => new Date(item.Tanggal) >= today)
            .sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal));
        
        initFilters();
        renderSchedules(allSchedules);
        attachParticipantListeners();
    } catch (error) {
        showError();
    } finally {
        loading.style.display = 'none';
    }
};

// Filter System
const initFilters = () => {
    const institutions = [...new Set(allSchedules.map(item => item.Institusi))];
    filterNav.innerHTML = `
        <button class="filter-btn active" data-filter="all">Semua</button>
        ${institutions.map(inst => `
            <button class="filter-btn" data-filter="${inst}">${inst}</button>
        `).join('')}
    `;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
};

const handleFilterClick = (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    filterSchedules();
};

const filterSchedules = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    
    const filtered = allSchedules.filter(item => {
        const matchesSearch = [
            item.Institusi,
            item.Mata_Pelajaran,
            item.Tanggal,
            item.Peserta.join(' ')
        ].some(text => text.toLowerCase().includes(searchTerm));
        
        const matchesFilter = activeFilter === 'all' || item.Institusi === activeFilter;
        
        return matchesSearch && matchesFilter;
    });

    renderSchedules(filtered);
    attachParticipantListeners();
};

// Rendering
const renderSchedules = (data) => {
    scheduleGrid.innerHTML = '';
    
    if (data.length === 0) {
        emptyState.style.display = 'flex';
        return;
    }
    
    emptyState.style.display = 'none';
    data.forEach(item => {
        const card = document.createElement('article');
        card.className = 'schedule-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${item.Mata_Pelajaran}</h3>
                <span>${formatDate(item.Tanggal)}</span>
            </div>
            <div class="institute">${item.Institusi}</div>
            <div class="participants">
                ${item.Peserta.map(peserta => `
                    <span class="participant-tag">${peserta}</span>
                `).join('')}
            </div>
        `;
        scheduleGrid.appendChild(card);
    });
};

// Participant Modal
const attachParticipantListeners = () => {
    document.querySelectorAll('.participant-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            showParticipantSchedule(e.target.textContent);
        });
    });
};

const showParticipantSchedule = (name) => {
    const modal = document.getElementById('participantModal');
    const today = new Date();
    const upcoming = allSchedules.filter(s => 
        s.Peserta.includes(name) && new Date(s.Tanggal) >= today
    );
    
    modal.style.display = 'block';
    document.getElementById('modalTitle').textContent = `Jadwal ${name}`;
    document.getElementById('modalSchedules').innerHTML = upcoming.length > 0 
        ? upcoming.map(s => `
            <div class="modal-schedule-item">
                <div class="modal-item-header">
                    <h4>${s.Mata_Pelajaran}</h4>
                    <span>${formatDate(s.Tanggal)}</span>
                </div>
                <div class="institute">${s.Institusi}</div>
            </div>
        `).join('')
        : `<p class="no-schedule">Tidak ada jadwal berikutnya</p>`;
};

// Utilities
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
});

const showError = () => {
    emptyState.innerHTML = `
        <i class="material-icons">error_outline</i>
        <h3>Gagal Memuat Data</h3>
        <p>Coba refresh halaman</p>
    `;
    emptyState.style.display = 'flex';
};

// Event Listeners
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
searchInput.addEventListener('input', filterSchedules);
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('participantModal').style.display = 'none';
});
window.onclick = (e) => {
    if(e.target === document.getElementById('participantModal')) {
        document.getElementById('participantModal').style.display = 'none';
    }
};

// Initialization
initTheme();
fetchData();
