// app.js
const API_URL = 'https://script.google.com/macros/s/AKfycby9sPywic_2ifeYBzE3dQMHfrwkR4-fQv-bNx74HMduvcq5Rr4r9MY6GGEYNqI44WRI/exec';
const MODAL_TYPES = {
    COURSE: 'course',
    INSTITUTION: 'institution',
    DATE: 'date',
    PARTICIPANT: 'participant'
};

let allSchedules = [];
const elements = {
    loading: document.getElementById('loading'),
    scheduleGrid: document.getElementById('scheduleGrid'),
    emptyState: document.getElementById('emptyState'),
    searchInput: document.getElementById('searchInput'),
    filterNav: document.getElementById('filterNav'),
    modal: document.getElementById('genericModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody')
};

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
    elements.filterNav.innerHTML = `
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
    const searchTerm = elements.searchInput.value.toLowerCase();
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
// MODAL HANDLING
// ======================
const showModal = (title, content) => {
    elements.modalTitle.textContent = title;
    elements.modalBody.innerHTML = content;
    elements.modal.style.display = 'block';
};

const generateModalContent = (data) => {
    if (data.length === 0) return `<p class="no-data">Tidak ada data yang tersedia</p>`;
    
    return data.map(item => `
        <div class="modal-item">
            <div class="modal-item-header">
                <h4>${item.Mata_Pelajaran}</h4>
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

const handleEntityClick = (type, value) => {
    let filteredData = [];
    let title = '';
    
    switch(type) {
        case MODAL_TYPES.COURSE:
            filteredData = allSchedules.filter(item => 
                item.Mata_Pelajaran === value && 
                new Date(item.Tanggal) >= new Date()
            );
            title = `Detail Mata Kuliah: ${value}`;
            break;
            
        case MODAL_TYPES.INSTITUTION:
            filteredData = allSchedules.filter(item => 
                item.Institusi === value && 
                new Date(item.Tanggal) >= new Date()
            );
            title = `Jadwal Institusi: ${value}`;
            break;
            
        case MODAL_TYPES.DATE:
            filteredData = allSchedules.filter(item => 
                formatDate(item.Tanggal) === value && 
                new Date(item.Tanggal) >= new Date()
            );
            title = `Jadwal Tanggal: ${value}`;
            break;
            
        case MODAL_TYPES.PARTICIPANT:
            filteredData = allSchedules.filter(item => 
                item.Peserta.includes(value) && 
                new Date(item.Tanggal) >= new Date()
            );
            title = `Jadwal Peserta: ${value}`;
            break;
    }
    
    showModal(title, generateModalContent(filteredData));
};

// ======================
// EVENT HANDLERS
// ======================
const attachDynamicListeners = ()