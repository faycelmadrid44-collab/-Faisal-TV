// Global Variables
let xtreamAPI = null;
let currentUser = null;
let currentCategory = 'channels';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let watchHistory = JSON.parse(localStorage.getItem('watchHistory')) || [];
let allStreams = [];
let allMovies = [];
let allSeries = [];
let isDarkMode = true;
let userSettings = JSON.parse(localStorage.getItem('userSettings')) || {
    quality: 'auto',
    darkMode: true,
    autoplay: true,
    subtitles: false,
    language: 'ar',
    animation: true
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);

    // Sidebar Menu
    const menuBtn = document.getElementById('menuBtn');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarMenu = document.getElementById('sidebarMenu');
    
    menuBtn.addEventListener('click', () => {
        sidebarMenu.classList.add('active');
        sidebarOverlay.classList.add('active');
    });
    
    closeSidebarBtn.addEventListener('click', () => {
        sidebarMenu.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
    
    sidebarOverlay.addEventListener('click', () => {
        sidebarMenu.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
    
    // Search Functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    const closeSearchBtn = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');
    
    searchBtn.addEventListener('click', () => {
        searchModal.style.display = 'flex';
        searchInput.focus();
    });
    
    closeSearchBtn.addEventListener('click', () => {
        searchModal.style.display = 'none';
        searchInput.value = '';
        document.getElementById('searchResults').innerHTML = '';
    });
    
    searchInput.addEventListener('input', performSearch);
    
    // Refresh Button
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.addEventListener('click', handleRefresh);
    
    // Theme Button
    const themeBtn = document.getElementById('themeBtn');
    themeBtn.addEventListener('click', toggleTheme);
    
    // Apply saved theme
    if (!userSettings.darkMode) {
        document.body.classList.add('light-mode');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Settings Changes
    document.querySelectorAll('input[name="quality"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            userSettings.quality = e.target.value;
            localStorage.setItem('userSettings', JSON.stringify(userSettings));
        });
    });
    
    document.getElementById('darkMode').addEventListener('change', (e) => {
        userSettings.darkMode = e.target.checked;
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    });
    
    document.getElementById('autoplay').addEventListener('change', (e) => {
        userSettings.autoplay = e.target.checked;
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    });
    
    document.getElementById('subtitles').addEventListener('change', (e) => {
        userSettings.subtitles = e.target.checked;
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    });
    
    document.getElementById('animationToggle').addEventListener('change', (e) => {
        userSettings.animation = e.target.checked;
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
        document.body.style.animation = e.target.checked ? 'auto' : 'none';
    });
    
    document.querySelectorAll('input[name="language"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            userSettings.language = e.target.value;
            localStorage.setItem('userSettings', JSON.stringify(userSettings));
        });
    });
    
    // Clear Cache
    document.getElementById('clearCache').addEventListener('click', () => {
        if (confirm('هل تريد مسح الذاكرة المؤقتة؟')) {
            localStorage.removeItem('favorites');
            favorites = [];
            alert('✅ تم مسح الذاكرة المؤقتة');
        }
    });
    
    // Clear History
    document.getElementById('clearHistory').addEventListener('click', () => {
        if (confirm('هل تريد مسح السجل؟')) {
            localStorage.removeItem('watchHistory');
            watchHistory = [];
            alert('✅ تم مسح السجل');
        }
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('هل تريد تسجيل الخروج؟')) {
            localStorage.removeItem('currentUser');
            location.reload();
        }
    });

    // Tab Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleTabChange);
    });

    // Bottom Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', handleNavigation);
    });

    // Player Controls
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    document.getElementById('qualityBtn').addEventListener('click', showQualityMenu);
    document.getElementById('exitBtn').addEventListener('click', showExitModal);

    // Exit Modal
    document.getElementById('confirmExit').addEventListener('click', exitApp);
    document.getElementById('cancelExit').addEventListener('click', hideExitModal);

    // Exit with Escape Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const playerScreen = document.getElementById('playerScreen');
            const searchModal = document.getElementById('searchModal');
            if (playerScreen.classList.contains('active')) {
                showExitModal();
            } else if (searchModal.style.display === 'flex') {
                searchModal.style.display = 'none';
            }
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();

    const host = document.getElementById('hostInput').value;
    const user = document.getElementById('userInput').value;
    const pass = document.getElementById('passInput').value;

    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = 'flex';

    try {
        xtreamAPI = new XtreamAPI(host, user, pass);
        currentUser = { host, user, pass };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Test connection
        const categories = await xtreamAPI.getCategories();
        if (categories.length === 0) {
            throw new Error('فشل الاتصال - تحقق من بيانات الدخول');
        }

        spinner.style.display = 'none';
        switchScreen('mainScreen');
        loadAccountInfo();
        loadChannels();

    } catch (error) {
        spinner.style.display = 'none';
        alert('❌ خطأ في تسجيل الدخول:\n' + error.message);
    }
}

function loadAccountInfo() {
    const accountInfo = document.getElementById('accountInfo');
    if (currentUser) {
        accountInfo.innerHTML = `
            <p><strong>المستخدم:</strong> ${currentUser.user}</p>
            <p><strong>السيرفر:</strong> ${currentUser.host}</p>
        `;
    }
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

async function handleTabChange(e) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.closest('.tab-btn').classList.add('active');

    const category = e.target.closest('.tab-btn').dataset.category;
    currentCategory = category;

    switch (category) {
        case 'channels':
            loadChannels();
            break;
        case 'movies':
            loadMovies();
            break;
        case 'series':
            loadSeries();
            break;
        case 'other':
            loadOther();
            break;
    }
}

async function handleRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.classList.add('spin');
    
    try {
        switch (currentCategory) {
            case 'channels':
                await loadChannels();
                break;
            case 'movies':
                await loadMovies();
                break;
            case 'series':
                await loadSeries();
                break;
        }
        alert('✅ تم التحديث بنجاح');
    } catch (error) {
        alert('❌ خطأ في التحديث: ' + error.message);
    } finally {
        refreshBtn.classList.remove('spin');
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    const themeBtn = document.getElementById('themeBtn');
    
    if (isDarkMode) {
        document.body.classList.remove('light-mode');
        themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.add('light-mode');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    userSettings.darkMode = isDarkMode;
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
}

function performSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    
    if (searchTerm.length === 0) {
        searchResults.innerHTML = '';
        return;
    }
    
    let results = [];
    
    // Search in streams
    results = results.concat(allStreams.filter(s => s.name.toLowerCase().includes(searchTerm)));
    
    // Search in movies
    results = results.concat(allMovies.filter(m => m.name.toLowerCase().includes(searchTerm)));
    
    // Search in series
    results = results.concat(allSeries.filter(s => s.name.toLowerCase().includes(searchTerm)));
    
    // Display results
    searchResults.innerHTML = '';
    if (results.length === 0) {
        searchResults.innerHTML = '<p style="color:#D4AF37;text-align:center;width:100%;">لا توجد نتائج</p>';
        return;
    }
    
    results.slice(0, 20).forEach(item => {
        const card = createItemCard(item, item.stream_id ? 'live' : (item.movie_id ? 'movie' : 'series'));
        card.addEventListener('click', () => {
            if (item.stream_id) playStream(item);
            else if (item.movie_id) playMovie(item);
            else selectSeries(item);
            document.getElementById('searchModal').style.display = 'none';
        });
        searchResults.appendChild(card);
    });
}

async function loadChannels() {
    const container = document.getElementById('subCategoriesContainer');
    const itemsGrid = document.getElementById('itemsGrid');

    container.innerHTML = '';
    itemsGrid.innerHTML = '<div style="text-align:center;color:#D4AF37;">جاري التحميل...</div>';

    try {
        const streams = await xtreamAPI.getStreams();
        allStreams = streams;

        // Group streams by category keywords
        const categories = {
            'الرياضة': [],
            'beIN': [],
            'Sky Sports': [],
            'الرياضات الأخرى': [],
            'عربية': [],
            'أجنبية': [],
        };

        streams.forEach(stream => {
            const name = stream.name.toLowerCase();
            
            if (name.includes('bein')) {
                categories['beIN'].push(stream);
            } else if (name.includes('sky')) {
                categories['Sky Sports'].push(stream);
            } else if (name.includes('sport') || name.includes('رياضة')) {
                categories['الرياضة'].push(stream);
            } else if (name.includes('arabic') || name.includes('عربي') || name.includes('ar')) {
                categories['عربية'].push(stream);
            } else {
                categories['أجنبية'].push(stream);
            }
        });

        // Create sub-category buttons
        Object.keys(categories).forEach(catName => {
            if (categories[catName].length > 0) {
                const btn = document.createElement('button');
                btn.className = 'sub-cat-btn';
                btn.textContent = catName + ' (' + categories[catName].length + ')';
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.sub-cat-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    displayStreams(categories[catName]);
                });
                container.appendChild(btn);
            }
        });

        // Display first category
        const firstCategory = Object.keys(categories).find(key => categories[key].length > 0);
        if (firstCategory) {
            container.querySelector('.sub-cat-btn').classList.add('active');
            displayStreams(categories[firstCategory]);
        }

    } catch (error) {
        itemsGrid.innerHTML = `<div style="color:#ff4444;">❌ خطأ: ${error.message}</div>`;
    }
}

async function loadMovies() {
    const container = document.getElementById('subCategoriesContainer');
    const itemsGrid = document.getElementById('itemsGrid');

    container.innerHTML = '';
    itemsGrid.innerHTML = '<div style="text-align:center;color:#D4AF37;">جاري التحميل...</div>';

    try {
        const movies = await xtreamAPI.getMovies();
        allMovies = movies;

        const genres = {
            'درما': [],
            'رعب': [],
            'أكشن': [],
            'كوميديا': [],
            'مغامرات': [],
            'ويسترن': [],
            'أفلام أخرى': []
        };

        movies.forEach(movie => {
            const name = movie.name.toLowerCase();
            
            if (name.includes('drama') || name.includes('دراما')) {
                genres['درما'].push(movie);
            } else if (name.includes('horror') || name.includes('رعب')) {
                genres['رعب'].push(movie);
            } else if (name.includes('action') || name.includes('أكشن')) {
                genres['أكشن'].push(movie);
            } else if (name.includes('comedy') || name.includes('كوميدي')) {
                genres['كوميديا'].push(movie);
            } else if (name.includes('adventure') || name.includes('مغامر')) {
                genres['مغامرات'].push(movie);
            } else if (name.includes('western') || name.includes('ويسترن')) {
                genres['ويسترن'].push(movie);
            } else {
                genres['أفلام أخرى'].push(movie);
            }
        });

        Object.keys(genres).forEach(genre => {
            if (genres[genre].length > 0) {
                const btn = document.createElement('button');
                btn.className = 'sub-cat-btn';
                btn.textContent = genre + ' (' + genres[genre].length + ')';
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.sub-cat-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    displayMovies(genres[genre]);
                });
                container.appendChild(btn);
            }
        });

        const firstGenre = Object.keys(genres).find(key => genres[key].length > 0);
        if (firstGenre) {
            container.querySelector('.sub-cat-btn').classList.add('active');
            displayMovies(genres[firstGenre]);
        }

    } catch (error) {
        itemsGrid.innerHTML = `<div style="color:#ff4444;">❌ خطأ: ${error.message}</div>`;
    }
}

async function loadSeries() {
    const container = document.getElementById('subCategoriesContainer');
    const itemsGrid = document.getElementById('itemsGrid');

    container.innerHTML = '';
    itemsGrid.innerHTML = '<div style="text-align:center;color:#D4AF37;">جاري التحميل...</div>';

    try {
        const series = await xtreamAPI.getSeries();
        allSeries = series;

        const categories = {
            'عربية': [],
            'أجنبية': [],
            'درامية': [],
            'كوميدية': []
        };

        series.forEach(s => {
            const name = s.name.toLowerCase();
            
            if (name.includes('arabic') || name.includes('عربي') || name.includes('ar')) {
                categories['عربية'].push(s);
            } else if (name.includes('drama') || name.includes('دراما')) {
                categories['درامية'].push(s);
            } else if (name.includes('comedy') || name.includes('كوميدي')) {
                categories['كوميدية'].push(s);
            } else {
                categories['أجنبية'].push(s);
            }
        });

        Object.keys(categories).forEach(cat => {
            if (categories[cat].length > 0) {
                const btn = document.createElement('button');
                btn.className = 'sub-cat-btn';
                btn.textContent = cat + ' (' + categories[cat].length + ')';
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.sub-cat-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    displaySeries(categories[cat]);
                });
                container.appendChild(btn);
            }
        });

        const firstCat = Object.keys(categories).find(key => categories[key].length > 0);
        if (firstCat) {
            container.querySelector('.sub-cat-btn').classList.add('active');
            displaySeries(categories[firstCat]);
        }

    } catch (error) {
        itemsGrid.innerHTML = `<div style="color:#ff4444;">❌ خطأ: ${error.message}</div>`;
    }
}

async function loadOther() {
    const container = document.getElementById('subCategoriesContainer');
    const itemsGrid = document.getElementById('itemsGrid');

    container.innerHTML = '';
    itemsGrid.innerHTML = '';

    // Sample other categories
    const otherCategories = {
        'أخبار': '📰',
        'وثائقيات': '🎥',
        'دين': '🕌',
        'ترفيه': '🎭'
    };

    Object.keys(otherCategories).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'sub-cat-btn';
        btn.textContent = cat;
        btn.addEventListener('click', () => {
            itemsGrid.innerHTML = `<div style="text-align:center;color:#D4AF37;padding:40px;">
                <div style="font-size:60px;margin-bottom:20px;">${otherCategories[cat]}</div>
                <p>${cat}</p>
                <p style="color:#999;margin-top:10px;">قريباً...</p>
            </div>`;
        });
        container.appendChild(btn);
    });

    itemsGrid.innerHTML = '<div style="text-align:center;color:#D4AF37;padding:40px;">اختر القسم</div>';
}

function displayStreams(streams) {
    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = '';

    streams.forEach(stream => {
        const card = createItemCard(stream, 'live');
        card.addEventListener('click', () => playStream(stream));
        grid.appendChild(card);
    });
}

function displayMovies(movies) {
    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = '';

    movies.forEach(movie => {
        const card = createItemCard(movie, 'movie');
        card.addEventListener('click', () => playMovie(movie));
        grid.appendChild(card);
    });
}

function displaySeries(seriesList) {
    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = '';

    seriesList.forEach(series => {
        const card = createItemCard(series, 'series');
        card.addEventListener('click', () => selectSeries(series));
        grid.appendChild(card);
    });
}

function createItemCard(item, type) {
    const card = document.createElement('div');
    card.className = 'item-card';

    const icon = getIcon(type);
    const title = item.name || item.title || 'بدون عنوان';

    card.innerHTML = `
        <button class="favorite-btn ${isFavorite(item.stream_id || item.movie_id || item.series_id) ? 'active' : ''}">
            <i class="fas fa-heart"></i>
        </button>
        <div class="item-poster">${icon}</div>
        <div class="item-info">
            <div class="item-title">${title}</div>
            <div class="item-badge">${type === 'live' ? '🔴 مباشر' : (type === 'movie' ? '🎬 فيلم' : '📺 مسلسل')}</div>
        </div>
    `;

    card.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(item, card.querySelector('.favorite-btn'));
    });

    return card;
}

function getIcon(type) {
    const icons = {
        'live': '📺',
        'movie': '🎬',
        'series': '📺'
    };
    return icons[type] || '🎥';
}

function playStream(stream) {
    addToHistory(stream);
    const url = xtreamAPI.getStreamUrl(stream.stream_id);
    playVideo(stream.name, url);
}

function playMovie(movie) {
    addToHistory(movie);
    const url = xtreamAPI.getStreamUrl(movie.movie_id, 'movie');
    playVideo(movie.name, url);
}

async function selectSeries(series) {
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.innerHTML = '<div style="text-align:center;color:#D4AF37;">جاري تحميل الحلقات...</div>';

    try {
        const info = await xtreamAPI.getSeriesInfo(series.series_id);
        if (!info || !info.episodes) {
            throw new Error('لم يتم العثور على حلقات');
        }

        const episodes = info.episodes;
        itemsGrid.innerHTML = '';

        Object.keys(episodes).sort((a, b) => parseInt(a) - parseInt(b)).forEach(season => {
            const seasonNum = parseInt(season);
            episodes[season].forEach(ep => {
                const episodeNum = ep.episode_num;
                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-poster">📺</div>
                    <div class="item-info">
                        <div class="item-title">الموسم ${seasonNum} - الحلقة ${episodeNum}</div>
                        <div class="item-badge">📺 حلقة</div>
                    </div>
                `;
                card.addEventListener('click', () => {
                    addToHistory(series);
                    const url = xtreamAPI.getEpisodeUrl(series.series_id, seasonNum, episodeNum);
                    playVideo(`${series.name} - S${seasonNum}E${episodeNum}`, url);
                });
                itemsGrid.appendChild(card);
            });
        });

    } catch (error) {
        itemsGrid.innerHTML = `<div style="color:#ff4444;">❌ خطأ: ${error.message}</div>`;
    }
}

function playVideo(title, url) {
    switchScreen('playerScreen');
    const player = document.getElementById('videoPlayer');
    player.src = url;
    if (userSettings.autoplay) {
        player.play();
    }
    document.title = title;
}

function toggleFullscreen() {
    const video = document.getElementById('videoPlayer');
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
    }
}

function showQualityMenu() {
    const menu = document.getElementById('qualityMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function showExitModal() {
    document.getElementById('exitModal').style.display = 'flex';
}

function hideExitModal() {
    document.getElementById('exitModal').style.display = 'none';
}

function exitApp() {
    document.getElementById('videoPlayer').pause();
    switchScreen('mainScreen');
    hideExitModal();
}

function handleNavigation(e) {
    const section = e.currentTarget.dataset.section;
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    if (section === 'settings') {
        const sidebarMenu = document.getElementById('sidebarMenu');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        sidebarMenu.classList.add('active');
        sidebarOverlay.classList.add('active');
    }
}

function toggleFavorite(item, button) {
    const itemId = item.stream_id || item.movie_id || item.series_id;
    const index = favorites.findIndex(fav => fav.id === itemId);

    if (index > -1) {
        favorites.splice(index, 1);
        button.classList.remove('active');
    } else {
        favorites.push({ id: itemId, name: item.name });
        button.classList.add('active');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function isFavorite(itemId) {
    return favorites.some(fav => fav.id === itemId);
}

function addToHistory(item) {
    const itemId = item.stream_id || item.movie_id || item.series_id;
    watchHistory = watchHistory.filter(h => h.id !== itemId);
    watchHistory.unshift({ id: itemId, name: item.name, date: new Date() });
    watchHistory = watchHistory.slice(0, 50);
    localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
}

// TV Remote Control Support
document.addEventListener('keydown', (e) => {
    const playerScreen = document.getElementById('playerScreen');
    
    if (playerScreen.classList.contains('active')) {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                const video = document.getElementById('videoPlayer');
                video.paused ? video.play() : video.pause();
                break;
            case 'ArrowRight':
                document.getElementById('videoPlayer').currentTime += 10;
                break;
            case 'ArrowLeft':
                document.getElementById('videoPlayer').currentTime -= 10;
                break;
            case 'ArrowUp':
                document.getElementById('videoPlayer').volume = Math.min(1, document.getElementById('videoPlayer').volume + 0.1);
                break;
            case 'ArrowDown':
                document.getElementById('videoPlayer').volume = Math.max(0, document.getElementById('videoPlayer').volume - 0.1);
                break;
        }
    }
});
