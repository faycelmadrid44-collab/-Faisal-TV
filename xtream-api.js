class XtreamAPI {
    constructor(host, username, password) {
        this.host = host;
        this.username = username;
        this.password = password;
        this.cache = {};
    }

    async request(action, params = {}) {
        let url = `${this.host}/player_api.php?username=${this.username}&password=${this.password}&action=${action}`;
        for(let key in params) {
            url += `&${key}=${params[key]}`;
        }
        
        // نستعمل بروكسي باش يتفادى مشكل CORS
        let proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        
        try {
            let response = await fetch(proxyUrl);
            if (!response.ok) throw new Error("خطأ في الشبكة");
            let data = await response.json();
            return data;
        } catch (error) {
            console.error("Xtream Error:", error);
            return [];
        }
    }

    // 1. جلب تصنيفات القنوات
    getLiveCategories() {
        return this.request('get_live_categories');
    }

    // 2. جلب كل القنوات
    getLiveStreams() {
        return this.request('get_live_streams');
    }

    // 3. جلب تصنيفات الافلام
    getVodCategories() {
        return this.request('get_vod_categories');
    }

    // 4. جلب الافلام حسب التصنيف
    getVodStreams(category_id) {
        return this.request('get_vod_streams', { category_id: category_id });
    }

    // 5. جلب تصنيفات المسلسلات
    getSeriesCategories() {
        return this.request('get_series_categories');
    }

    // 6. جلب المسلسلات حسب التصنيف
    getSeries(category_id) {
        return this.request('get_series', { category_id: category_id });
    }

    // 7. جلب معلومات المسلسل والحلقات
    getSeriesInfo(series_id) {
        return this.request('get_series_info', { series_id: series_id });
    }

    // 8. جلب معلومات القناة EPG
    getShortEpg(stream_id) {
        return this.request('get_short_epg', { stream_id: stream_id });
    }
}
