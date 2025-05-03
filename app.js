// app.js
const API_URL = 'https://script.google.com/macros/s/AKfycby9sPywic_2ifeYBzE3dQMHfrwkR4-fQv-bNx74HMduvcq5Rr4r9MY6GGEYNqI44WRI/exec';

// Elemen DOM
const elements = {
    searchInput: document.getElementById('searchInput'),
    institutionFilter: document.getElementById('institutionFilter'),
    scheduleGrid: document.getElementById('scheduleGrid'),
    loading: document.getElementById('loading'),
    emptyState: document.getElementById('emptyState'),
    modal: document.getElementById('genericModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody')
};

let allSchedules = [];

// ======================
// THEME MANAGEMENT
// ======================
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
};

const updateThemeIcon = (theme) => {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.style.transform = theme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)';
};

// ======================
// DATA MANAGEMENT
// ======================
const fetchData = async () => {
    try {
        elements.loading.style.display = 'flex';
        const response = await fetch(API_URL);
        const data = await response.json();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        allSchedules = data
            .filter(item => new Date(item.Tanggal) >= today)
            .sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal));
        
        initFilters();
        renderSchedules(allSchedules);
        attachDynamicListeners();
    } catch (error) {
        console.error('Error:', error);
        showError();
    } finally {
        elements.loading.style.display = 'none';
    }
};

// ======================
// FILTER SYSTEM
// ======================
const initFilters = () => {
    const institutions = [...new Set(allSchedules.map(item => item.Institusi))];
    const filterSelect = elements.institutionFilter;
    
    // Clear existing options
    filterSelect.innerHTML = '<option value="all">Semua Institusi</option>';
    
    // Add new options
    institutions.forEach(inst => {
        const option = document.createElement('option');
        option.value = inst;
        option.textContent = inst;
        filterSelect.appendChild(option);
    });

    // Event listeners
    elements.searchInput.addEventListener('input', filterSchedules);
    filterSelect.addEventListener('change', filterSchedules);
};

const filterSchedules = () => {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const selectedInstitution = elements.institutionFilter.value;
    
    const filtered = allSchedules.filter(item => {
        const matchesSearch = [
            item.Institusi,
            item.Mata_Pelajaran,
            item.Tanggal,
            item.Peserta.join(' ')
        ].some(text => text.toLowerCase().includes(searchTerm));
        
        const matchesInstitution = selectedInstitution === 'all' || item.Institusi === selectedInstitution;
        
        return matchesSearch && matchesInstitution;
    });

    renderSchedules(filtered);
};

// ======================
// RENDERING
// ======================
const renderSchedules = (data) => {
    elements.scheduleGrid.innerHTML = '';
    
    if (data.length === 0) {
        elements.emptyState.style.display = 'flex';
        return;
    }
    
    elements.emptyState.style.display = 'none';

    data.forEach(item => {
        const card = document.createElement('article');
        card.className = 'schedule-card';
        card.innerHTML = `
            <div class="card-header">
                <h3 class="clickable course-title">${item.Mata_Pelajaran}</h3>
                <span class="date-display clickable">${formatDate(item.Tanggal)}</span>
            </div>
            <div class="institute clickable">${item.Institusi}</div>
            <div class="participants">
                ${item.Peserta.map(peserta => `
                    <span class="participant-tag clickable">${peserta}</span>
                `).join('')}
            </div>
        `;
        elements.scheduleGrid.appendChild(card);
    });
};

// ======================
// MODAL SYSTEM
// ======================
const showGenericModal = (title, data) => {
    elements.modalTitle.textContent = title;
    elements.modalBody.innerHTML = generateModalContent(data);
    elements.modal.style.display = 'block';
};

const generateModalContent = (data) => {
    if (data.length === 0) return '<p class="no-data">Tidak ada data yang tersedia</p>';
    
    return data.map(item => `
        <div class="modal-item">
            <div class="card-header">
                <h4 class="course-title">${item.Mata_Pelajaran}</h4>
                <div class="modal-meta">
                    <span class="institute">${item.Institusi}</span>
                    <span class="date-display">${formatDate(item.Tanggal)}</span>
                </div>
            </div>
            <div class="participants">
                ${item.Peserta.map(p => `
                    <span class="participant-tag">${p}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
};

// ======================
// EVENT HANDLERS
// ======================
const handleEntityClick = (element, property) => {
    const value = element.textContent;
    const filteredData = allSchedules.filter(item => 
        item[property] === value && 
        new Date(item.Tanggal) >= new Date()
    );
    
    showGenericModal(`Jadwal ${value}`, filteredData);
};

const attachDynamicListeners = () => {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('course-title')) {
            handleEntityClick(e.target, 'Mata_Pelajaran');
        }
        else if (e.target.classList.contains('date-display')) {
            handleEntityClick(e.target, 'Tanggal');
        }
        else if (e.target.classList.contains('institute')) {
            handleEntityClick(e.target, 'Institusi');
        }
        else if (e.target.classList.contains('participant-tag')) {
            const participantName = e.target.textContent;
            const filteredData = allSchedules.filter(item => 
                item.Peserta.includes(participantName) && 
                new Date(item.Tanggal) >= new Date()
            );
            showGenericModal(`Jadwal ${participantName}`, filteredData);
        }
    });
};

// ======================
// UTILITIES
// ======================
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
};

const showError = () => {
    elements.emptyState.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Gagal Memuat Data</h3>
        <p>Coba refresh halaman atau coba lagi nanti</p>
    `;
    elements.emptyState.style.display = 'flex';
};

// ======================
// INITIALIZATION
// ======================
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
window.addEventListener('click', (e) => {
    if (e.target === elements.modal) elements.modal.style.display = 'none';
});
document.querySelector('.close-modal').addEventListener('click', () => {
    elements.modal.style.display = 'none';
});

// Start Application
initTheme();
fetchData();