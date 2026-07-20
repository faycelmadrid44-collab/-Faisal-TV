class XtreamAPI {
    constructor(host, username, password) {
        this.host = host.replace(/\/$/, '');
        this.username = username;
        this.password = password;
        this.baseURL = `${this.host}/player_api.php`;
    }

    async getCategories(type = 'live') {
        try {
            const url = `${this.baseURL}?action=get_live_categories&username=${this.username}&password=${this.password}`;
            const response = await fetch(url);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('خطأ في جلب الفئات:', error);
            return [];
        }
    }

    async getStreams(categoryId = null) {
        try {
            let url = `${this.baseURL}?action=get_live_streams&username=${this.username}&password=${this.password}`;
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('خطأ في جلب البث المباشر:', error);
            return [];
        }
    }

    async getMovies(categoryId = null) {
        try {
            let url = `${this.baseURL}?action=get_movies&username=${this.username}&password=${this.password}`;
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('خطأ في جلب الأفلام:', error);
            return [];
        }
    }

    async getSeries(categoryId = null) {
        try {
            let url = `${this.baseURL}?action=get_series&username=${this.username}&password=${this.password}`;
            if (categoryId) {
                url += `&category_id=${categoryId}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('خطأ في جلب المسلسلات:', error);
            return [];
        }
    }

    async getSeriesInfo(seriesId) {
        try {
            const url = `${this.baseURL}?action=get_series_info&series_id=${seriesId}&username=${this.username}&password=${this.password}`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('خطأ في جلب معلومات المسلسل:', error);
            return null;
        }
    }

    async getEpisodes(seriesId) {
        try {
            const info = await this.getSeriesInfo(seriesId);
            if (info && info.episodes) {
                return info.episodes;
            }
            return {};
        } catch (error) {
            console.error('خطأ في جلب الحلقات:', error);
            return {};
        }
    }

    getStreamUrl(streamId, type = 'live') {
        if (type === 'live') {
            return `${this.host}/live/${this.username}/${this.password}/${streamId}`;
        } else if (type === 'movie') {
            return `${this.host}/movie/${this.username}/${this.password}/${streamId}`;
        } else if (type === 'series') {
            return `${this.host}/series/${this.username}/${this.password}/${streamId}`;
        }
        return '';
    }

    getEpisodeUrl(seriesId, seasonNum, episodeNum) {
        return `${this.host}/series/${this.username}/${this.password}/${seriesId}:${seasonNum}:${episodeNum}`;
    }

    getPosterUrl(posterPath) {
        if (!posterPath) return null;
        if (posterPath.startsWith('http')) {
            return posterPath;
        }
        return `${this.host}${posterPath}`;
    }
}
