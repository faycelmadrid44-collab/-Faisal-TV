// ========== FAISAL TV PRO MAX v2.0 ==========
let api;
let currentCategory = 'channels';
let currentSubCategory = 0;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];
let allStreams = [];
let allVod = [];
let allSeries = [];

const CONFIG = {
    HOST: "http://longsat.xyz:80",
    USER: "delfraissy",
    PASS: "aout0023",
    APP_NAME: "Faisal TV"
};

// ========== XTREAM API ==========
class XtreamAPI {
    constructor(host, username, password) {
        this.host = host;
        this.username = username;
        this.password = password;
    }
    async request(action, params = {}) {
        let url = `${this.host}/player_api.php?username=${this.username}&password=${this.password}&action=${action}`;
        for(let key in params) url += `&${key}=${params[key]}`;
        let proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        try {
            let res = await fetch(proxyUrl);
            return await res.json();
        } catch (e) {
            console.error("Error:", e);
            return [];
        }
    }
    getLiveCategories(){return this.request('get_live_categories')}
    getLiveStreams(){return this.request('get_live_streams')}
    getVodCategories(){return this.request('get_vod_categories')}
    getVodStreams(cat){return cat?this.request('get_vod_streams',{category_id:cat}):this.request('get_vod_streams')}
    getSeriesCategories(){return this.request('get_series_categories')}
    getSeries(cat){return cat?this.request('get_series',{category_id:cat}):this.request('get_series')}
}

// ========== INIT ==========
window.onload = () => {
    api = new XtreamAPI(CONFIG.HOST, CONFIG.USER, CONFIG.PASS);
    setupButtons();
    loadCategory('channels');
    loadFavorites();
};

// ========== BUTTONS SETUP ==========
function setupButtons(){
    // Header buttons
    document.getElementById('searchBtn').onclick = showSearch;
    document.getElementById('refreshBtn').onclick = () => location.reload();
    document.getElementById('themeBtn').onclick = toggleTheme;
    document.getElementById('menuBtn').onclick = openMenu;
    document.getElementById('closeMenu').onclick = closeMenu;
    document.getElementById('menuOverlay').onclick = closeMenu;
    document.getElementById('exitBtn').onclick = exitPlayer;

    // Main Tabs
    document.querySelectorAll('.main-tab').forEach(btn=>{
        btn.onclick = () => {
            document.querySelectorAll('.main-tab').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            loadCategory(btn.dataset.category);
        }
    });

    // Bottom Nav
    document.querySelectorAll('.nav-item').forEach(btn=>{
        btn.onclick = () => {
            document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            handleNavClick(btn.dataset.section);
        }
    });
}

// ========== LOAD CATEGORY ==========
async function loadCategory(cat){
    currentCategory = cat;
    document.getElementById('itemsGrid').innerHTML = '<div class="loading">جاري التحميل...</div>';
    document.getElementById('subCategoriesContainer').innerHTML = '';

    if(cat == 'channels'){
        let cats = await api.getLiveCategories();
        renderSubCategories(cats, loadLive);
        if(cats.length > 0) loadLive(cats[0].category_id);
    }
    if(cat == 'movies'){
        let cats = await api.getVodCategories();
        renderSubCategories(cats, loadVod);
        if(cats.length > 0) loadVod(cats[0].category_id);
    }
    if(cat == 'series'){
        let cats = await api.getSeriesCategories();
        renderSubCategories(cats, loadSeries);
        if(cats.length > 0) loadSeries(cats[0].category_id);
    }
    if(cat == 'matches'){
        showToast('قسم المباريات قريبا');
    }
}

function renderSubCategories(cats, callback){
    document.getElementById('subCategoriesContainer').innerHTML = cats.slice(0,12).map((c,i)=>`
        <button class="${i==0?'active':''}" onclick="setActiveSub(this);${callback.name}(${c.category_id})">
            ${c.category_name}
        </button>
    `).join('');
}

function setActiveSub(btn){
    document.querySelectorAll('.sub-categories button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
}

// ========== LOAD DATA ==========
async function loadLive(catId){
    let data = await api.getLiveStreams();
    allStreams = data.filter(x => x.category_id == catId).slice(0,100);
    renderItems(allStreams, 'live');
}

async function loadVod(catId){
    let data = await api.getVodStreams(catId);
    allVod = data.slice(0,100);
    renderItems(allVod, 'vod');
}

async function loadSeries(catId){
    let data = await api.getSeries(catId);
    allSeries = data.slice(0,100);
    renderItems(allSeries, 'series');
}

// ========== RENDER ITEMS ==========
function renderItems(items, type){
    if(items.length == 0){
        document.getElementById('itemsGrid').innerHTML = '<div class="loading">لا توجد عناصر</div>';
        return;
    }
    
    document.getElementById('itemsGrid').innerHTML = items.map(x=>{
        let isFav = favorites.includes(x.stream_id || x.series_id || x.id);
        let icon = type == 'live' ? 'fa-tv' : type == 'vod' ? 'fa-film' : 'fa-video';
        
        return `
        <div class="item-card-pro" onclick="playItem('${x.stream_id || x.id}', '${type}', '${x.name}')">
            <button class="item-fav ${isFav?'active':''}" onclick="event.stopPropagation();toggleFav(${x.stream_id || x.id})">
                <i class="${isFav?'fas':'far'} fa-star"></i>
            </button>
            <div class="item-icon"><i class="fas ${icon}"></i></div>
            <div class="item-title">${x.name}</div>
        </div>
        `;
    }).join('');
}

// ========== PLAYER ==========
function playItem(id, type, name){
    let url = '';
    if(type == 'live'){
        url = `${CONFIG.HOST}/live/${CONFIG.USER}/${CONFIG.PASS}/${id}.m3u8`;
    }
    if(type == 'vod'){
        url = `${CONFIG.HOST}/movie/${CONFIG.USER}/${CONFIG.PASS}/${id}.mp4`;
    }
    
    // حفظ في السجل
    addToHistory({id, name, type});
    
    document.getElementById('mainScreen').classList.remove('active');
    document.getElementById('playerScreen').classList.add('active');
    document.getElementById('videoPlayer').src = url;
}

function exitPlayer(){
    document.getElementById('videoPlayer').pause();
    document.getElementById('videoPlayer').src = '';
    document.getElementById('playerScreen').classList.remove('active');
    document.getElementById('mainScreen').classList.add('active');
}

// ========== FAVORITES ==========
function toggleFav(id){
    if(favorites.includes(id)){
        favorites = favorites.filter(f => f != id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadCategory(currentCategory);
}

function loadFavorites(){
    // تحميل المفضلة
}

// ========== HISTORY ==========
function addToHistory(item){
    history = history.filter(h => h.id != item.id);
    history.unshift(item);
    if(history.length > 50) history.pop();
    localStorage.setItem('history', JSON.stringify(history));
}

// ========== MENU & UI ==========
function openMenu(){
    document.getElementById('sideMenu').classList.add('active');
    document.getElementById('menuOverlay').classList.add('active');
}
function closeMenu(){
    document.getElementById('sideMenu').classList.remove('active');
    document.getElementById('menuOverlay').classList.remove('active');
}

function toggleTheme(){
    document.body.classList.toggle('light');
    showToast('تم تغيير الثيم');
}

function showSearch(){
    let query = prompt('ابحث عن قناة او فيلم:');
    if(query){
        let results = allStreams.filter(x => x.name.toLowerCase().includes(query.toLowerCase()));
        renderItems(results, 'live');
    }
}

function handleNavClick(section){
    if(section == 'favorites'){
        let favItems = allStreams.filter(x => favorites.includes(x.stream_id));
        renderItems(favItems, 'live');
    }
    if(section == 'home'){
        loadCategory('channels');
    }
}

function showToast(msg){
    alert(msg);
}
