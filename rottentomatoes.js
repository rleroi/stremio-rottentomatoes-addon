import axios from 'axios';
import { load as loadCheerio } from 'cheerio';
import 'dotenv/config'

const rtIds = {};

export async function getCatalog(type = 'movie', genre = null) {
    let list = 'movies_at_home/critics:certified_fresh';
    if (type === 'series') {
        list = 'tv_series_browse/critics:fresh~sort:popular'
    }

    let genreString = '';
    if (genre) {
        genreString = '~genres:' + genre;
    }

    const metas = [];
    let after = '';
    let hasMore = true;
    for (let page = 1; page < (process.env.RT_PAGES || 1) && hasMore; page++) {
        let url = `https://www.rottentomatoes.com/napi/browse/${list}${genreString}?after=${after}`;
        let res = await axios.get(url);
        for (const item of res.data?.grid?.list || []) {
            if (!rtIds?.[item?.emsId]) {
                const year = await getYear(item);
                rtIds[item.emsId] = await getTmdbMeta(item, type, year);
            }
            
            if (rtIds?.[item?.emsId]) {
                metas.push(rtIds[item.emsId]);
            }
        }
        after = encodeURIComponent(res.data?.pageInfo?.endCursor || '');
        hasMore = res.data?.pageInfo?.hasNextPage;
    }

    return metas;
}

async function getTmdbMeta(item, type, year) {
    const tmdbType = type === 'movie' ? 'movie' : 'tv';
    const title = item?.title?.trim();
    const tmdb = await axios.get(`https://api.themoviedb.org/3/search/${tmdbType}?query=${title}&include_adult=false&year=${year}&language=en-US&page=1`, {
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer ' + process.env.TMDB_TOKEN,
        }
    });

    // Get first item
    let tmdbItem = tmdb?.data?.results?.shift() || [];
    if (!tmdbItem?.id) {
        console.warn('tmdbItem not found for', type, '-', item.title, '-', year);
        return null;
    }

    const externalIds = await axios.get(`https://api.themoviedb.org/3/${tmdbType}/${tmdbItem?.id}/external_ids`, {
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer ' + process.env.TMDB_TOKEN,
        }
    });

    if (!externalIds?.data?.imdb_id) {
        console.warn('IMDB ID not found for', item.title, '-', (tmdbItem?.title || tmdbItem?.original_name), '-', year);
        return null;
    }

    return {
        id: externalIds.data.imdb_id,
        type: type,
        name: item.title,
        poster: item.posterUri,
        description: tmdbItem?.overview,
    };
}

async function getYear(item) {
    const url = 'https://www.rottentomatoes.com/' + item?.mediaUrl?.trim();
    let res;
    try {
        res = await axios.get(url);
    } catch(e) {
        console.error(e.message, url);

        return null;
    }
    const $ = loadCheerio(res.data);

    let year;
    if (!year) {
        // first season year
        year = $('[data-qa="season-item"]')?.last()?.attr('info')?.trim()?.match(/([0-9]+), /)?.pop();
    }

    if (!year) {
        // json data year
        (new Date(JSON.parse($('script[type="application/ld+json"]').text())?.dateCreated))?.getFullYear()
    }

    if (!year) {
        // movie subtitle year
        year = $('[data-qa="score-panel-subtitle"]')?.first()?.text()?.trim()?.match(/([0-9]+), /)?.pop();
    }

    return year || null;
}