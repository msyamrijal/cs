const API_URL = 'https://script.google.com/macros/s/AKfycby9sPywic_2ifeYBzE3dQMHfrwkR4-fQv-bNx74HMduvcq5Rr4r9MY6GGEYNqI44WRI/exec';
let allSchedules = [];

// Inisialisasi Aplikasi
async function init() {
    await fetchData();
    setupEventListeners();
    loadTheme();
}

// Ambil data dari API
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const rawData = await response.json();
        allSchedules = processData(rawData);
        renderSchedules(allSchedules);
    } catch (error) {
        console.error('Gagal memuat data:', error);
    }
}

// Proses data mentah
function processData(rawData) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return rawData
        .filter(item => new Date(item.Tanggal) >= today)
        .sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal));
}

// Render jadwal ke grid
function renderSchedules(data) {
    const grid = document.getElementById('scheduleGrid');
    grid.innerHTML = data.map(item => `
        <div class="card">
            <h3 class="course-title" onclick="showCourseDetail('${item.Mata_Pelajaran}')">
                ${item.Mata_Pelajaran}
            </h3>
            <p class="date-header" onclick="showDateSchedules('${item.Tanggal}')">
                ${formatDate(item.Tanggal)}
            </p>
            <p>${item.Institusi}</p>
            <div class="participants">
                ${item.Peserta.map(p => `
                    <span class="participant" onclick="showParticipant('${p}')">${p}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Format tanggal
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
}

// Tampilkan modal peserta
function showParticipant(name) {
    const filtered = allSchedules.filter(item => 
        item.Peserta.includes(name) && 
        new Date(item.Tanggal) >= new Date()
    );
    
    document.getElementById('modalParticipantTitle').textContent = `Jadwal ${name}`;
    document.getElementById('modalParticipantContent').innerHTML = filtered.length > 0 
        ? filtered.map(item => `
            <div class="modal-section">
                <h4>${item.Mata_Pelajaran}</h4>
                <p><strong>Institusi:</strong> ${item.Institusi}</p>
                <p><strong>Tanggal:</strong> ${formatDate(item.Tanggal)}</p>
                <p><strong>Peserta Lain:</strong> ${item.Peserta.filter(p => p !== name).join(', ')}</p>
            </div>
        `).join('')
        : '<p>Tidak ada jadwal berikutnya</p>';
    
    showModal('participantModal');
}

// Tampilkan detail mata kuliah
function showCourseDetail(courseName) {
    const courseData = allSchedules.find(item => item.Mata_Pelajaran === courseName);
    
    document.getElementById('modalCourseTitle').textContent = courseName;
    document.getElementById('modalCourseContent').innerHTML = `
        <div class="modal-section">
            <p><strong>Institusi:</strong> ${courseData.Institusi}</p>
            <p><strong>Tanggal:</strong> ${formatDate(courseData.Tanggal)}</p>
            <p><strong>Peserta:</strong></p>
            <div class="participants">
                ${courseData.Peserta.map(p => `
                    <span class="participant" onclick="showParticipant('${p}')">${p}</span>
                `).join('')}
            </div>
        </div>
    `;
    
    showModal('courseModal');
}

// Tampilkan jadwal berdasarkan tanggal
function showDateSchedules(dateString) {
    const filtered = allSchedules.filter(item => item.Tanggal === dateString);
    const formattedDate = formatDate(dateString);
    
    document.getElementById('modalDateTitle').textContent = `Jadwal ${formattedDate}`;
    document.getElementById('modalDateContent').innerHTML = filtered.length > 0 
        ? filtered.map(item => `
            <div class="modal-section">
                <h4>${item.Mata_Pelajaran}</h4>
                <p><strong>Institusi:</strong> ${item.Institusi}</p>
                <p><strong>Peserta:</strong> ${item.Peserta.join(', ')}</p>
            </div>
        `).join('')
        : '<p>Tidak ada jadwal untuk tanggal ini</p>';
    
    showModal('dateModal');
}

// Fungsi umum modal
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Manajemen tema
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.querySelector('#themeToggle i').classList.replace('fa-moon', 'fa-sun');
    }
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.hasAttribute('data-theme');
    const icon = document.querySelector('#themeToggle i');
    
    if(isDark) {
        body.removeAttribute('data-theme');
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

// Event listeners
function setupEventListeners() {
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allSchedules.filter(item =>
            item.Mata_Pelajaran.toLowerCase().includes(term) ||
            item.Institusi.toLowerCase().includes(term) ||
            item.Peserta.some(p => p.toLowerCase().includes(term))
        );
        renderSchedules(filtered);
    });

    window.onclick = (e) => {
        if(e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    };
}

// Jalankan aplikasi
init();