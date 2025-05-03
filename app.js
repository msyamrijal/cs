// Islamic Schedule App
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        prayerTimes: document.querySelector('.prayer-grid'),
        scheduleGrid: document.querySelector('.schedule-grid'),
        quranVerse: document.querySelector('.verse'),
        verseReference: document.querySelector('.reference')
    };

    // Prayer Times Data
    const prayerTimes = {
        fajr: '04:30',
        dhuhr: '12:30',
        asr: '15:45',
        maghrib: '18:30',
        isha: '20:00'
    };

    // Quran Verses Data
    const quranVerses = [
        {
            verse: "And We have not sent you, [O Muhammad], except as a mercy to the worlds.",
            reference: "Quran 21:107"
        },
        {
            verse: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
            reference: "Quran 2:152"
        },
        {
            verse: "And Allah is the best of planners.",
            reference: "Quran 3:54"
        }
    ];

    // Initialize App
    function init() {
        renderPrayerTimes();
        renderQuranVerse();
        renderSchedule();
        setupEventListeners();
    }

    // Render Prayer Times
    function renderPrayerTimes() {
        elements.prayerTimes.innerHTML = '';
        Object.entries(prayerTimes).forEach(([prayer, time]) => {
            const prayerElement = document.createElement('div');
            prayerElement.className = 'prayer';
            prayerElement.innerHTML = `
                <span class="prayer-name">${prayer}</span>
                <span class="prayer-time">${time}</span>
            `;
            elements.prayerTimes.appendChild(prayerElement);
        });
    }

    // Render Quran Verse
    function renderQuranVerse() {
        const randomVerse = quranVerses[Math.floor(Math.random() * quranVerses.length)];
        elements.quranVerse.textContent = randomVerse.verse;
        elements.verseReference.textContent = randomVerse.reference;
    }

    // Render Schedule
    function renderSchedule() {
        // In a real app, this would fetch data from an API
        const scheduleData = [
            {
                title: "Quran Study",
                time: "08:00",
                location: "Masjid Al-Furqan"
            },
            {
                title: "Islamic History",
                time: "10:00",
                location: "Islamic Center"
            }
        ];

        elements.scheduleGrid.innerHTML = '';
        scheduleData.forEach(item => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            scheduleItem.innerHTML = `
                <h3>${item.title}</h3>
                <p>${item.time} at ${item.location}</p>
            `;
            elements.scheduleGrid.appendChild(scheduleItem);
        });
    }

    // Event Listeners
    function setupEventListeners() {
        // Refresh verse daily
        setInterval(renderQuranVerse, 24 * 60 * 60 * 1000);

        // Prayer time click handler
        elements.prayerTimes.addEventListener('click', function(e) {
            if (e.target.closest('.prayer')) {
                const prayerName = e.target.closest('.prayer').querySelector('.prayer-name').textContent;
                alert(`Time for ${prayerName} prayer!`);
            }
        });
    }

    // Initialize the app
    init();
});