import { getCatalog } from './rottentomatoes.js';
import stremioSdk from 'stremio-addon-sdk';
const { addonBuilder, serveHTTP, publishToCentral } = stremioSdk;

let certified_fresh_movie_catalog = [];
let certified_fresh_series_catalog = [];
let verified_hot_movie_catalog = [];
let verified_hot_series_catalog = [];
let certified_fresh_movie_genres = {
    action: [],
    adventure: [],
    animation: [],
    anime: [],
    biography: [],
    comedy: [],
    crime: [],
    documentary: [],
    drama: [],
    fantasy: [],
    lgbtq: [],
    history: [],
    horror: [],
    kids_and_family: [],
    mystery_and_thriller: [],
    romance: [],
    sci_fi: [],
    war: [],
    western: [],
}
let certified_fresh_series_genres = {
    action: [],
    adventure: [],
    animation: [],
    anime: [],
    biography: [],
    comedy: [],
    crime: [],
    documentary: [],
    drama: [],
    fantasy: [],
    lgbtq: [],
    history: [],
    horror: [],
    kids_and_family: [],
    mystery_and_thriller: [],
    romance: [],
    sci_fi: [],
    war: [],
    western: [],
}
let verified_hot_movie_genres = {
    action: [],
    adventure: [],
    animation: [],
    anime: [],
    biography: [],
    comedy: [],
    crime: [],
    documentary: [],
    drama: [],
    fantasy: [],
    lgbtq: [],
    history: [],
    horror: [],
    kids_and_family: [],
    mystery_and_thriller: [],
    romance: [],
    sci_fi: [],
    war: [],
    western: [],
}
let verified_hot_series_genres = {
    action: [],
    adventure: [],
    animation: [],
    anime: [],
    biography: [],
    comedy: [],
    crime: [],
    documentary: [],
    drama: [],
    fantasy: [],
    lgbtq: [],
    history: [],
    horror: [],
    kids_and_family: [],
    mystery_and_thriller: [],
    romance: [],
    sci_fi: [],
    war: [],
    western: [],
}

const builder = new addonBuilder({
    id: 'pw.ers.rottentomatoes',
    version: '1.0.6',
    name: 'Rotten Tomatoes',
    description: 'Certified Fresh Movies to Stream at Home and Best TV Shows.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Rotten_Tomatoes_alternative_logo.svg',
    background: 'https://www.rottentomatoes.com/assets/pizza-pie/head-assets/images/RT_TwitterCard_2018.jpg',
    config: [
        {
            key: 'rpdb_key',
            type: 'text',
            title: 'RPDB API Key',
        }
    ],
    behaviorHints: {
        configurable: true,
    },
    catalogs: [
        {
            name: 'RT: Certified Fresh',
            type: 'movie',
            id: 'rtfresh_movie',
            extra: [
                {
                    name: 'genre',
                    isRequired: false,
                    options: [
                        'Action',
                        'Adventure',
                        'Animation',
                        'Anime',
                        'Biography',
                        'Comedy',
                        'Crime',
                        'Documentary',
                        'Drama',
                        'Fantasy',
                        'LGBTQ+',
                        'History',
                        'Horror',
                        'Kids & Family',
                        'Mystery & Thriller',
                        'Romance',
                        'Sci-Fi',
                        'War',
                        'Western',
                    ]
                }
            ]
        },
        {
            name: 'RT: Verified Hot',
            type: 'movie',
            id: 'rthot_movie',
            extra: [
                {
                    name: 'genre',
                    isRequired: false,
                    options: [
                        'Action',
                        'Adventure',
                        'Animation',
                        'Anime',
                        'Biography',
                        'Comedy',
                        'Crime',
                        'Documentary',
                        'Drama',
                        'Fantasy',
                        'LGBTQ+',
                        'History',
                        'Horror',
                        'Kids & Family',
                        'Mystery & Thriller',
                        'Romance',
                        'Sci-Fi',
                        'War',
                        'Western',
                    ]
                }
            ]
        },
        {
            name: 'RT: Fresh TV Shows',
            type: 'series',
            id: 'rtfresh_series',
            extra: [
                {
                    name: 'genre',
                    isRequired: false,
                    options: [
                        'Action',
                        'Adventure',
                        'Animation',
                        'Anime',
                        'Biography',
                        'Comedy',
                        'Crime',
                        'Documentary',
                        'Drama',
                        'Fantasy',
                        'LGBTQ+',
                        'History',
                        'Horror',
                        'Kids & Family',
                        'Mystery & Thriller',
                        'Romance',
                        'Sci-Fi',
                        'War',
                        'Western',
                    ]
                }
            ]
        },
        {
            name: 'RT: Hot TV Shows',
            type: 'series',
            id: 'rthot_series',
            extra: [
                {
                    name: 'genre',
                    isRequired: false,
                    options: [
                        'Action',
                        'Adventure',
                        'Animation',
                        'Anime',
                        'Biography',
                        'Comedy',
                        'Crime',
                        'Documentary',
                        'Drama',
                        'Fantasy',
                        'LGBTQ+',
                        'History',
                        'Horror',
                        'Kids & Family',
                        'Mystery & Thriller',
                        'Romance',
                        'Sci-Fi',
                        'War',
                        'Western',
                    ]
                }
            ]
        },
    ],
    resources: ['catalog'],
    types: ['movie', 'series'],
    idPrefixes: ['tt']
})

async function main() {
    const { url, server } = await serveHTTP(builder.getInterface(), { port: process.env.PORT || 8080 });

    setInterval(initCatalogs, 1000 * 60 * 60 * 24);
    await initCatalogs();

    // if (process.env.ADDON_DOMAIN) {
    //     publishToCentral(`https://${process.env.ADDON_DOMAIN}/manifest.json`);
    // }
}

async function initCatalogs() {
    console.log('Building catalog');
    certified_fresh_movie_catalog = await getCatalog('movie');
    console.log('Movie catalog done');
    certified_fresh_series_catalog = await getCatalog('series');
    console.log('Series catalog done');
    verified_hot_movie_catalog = await getCatalog('movie:audience');
    console.log('Movie:audience catalog done');
    verified_hot_series_catalog = await getCatalog('series:audience');
    console.log('Series:audience catalog done');
    for (const genre of Object.keys(certified_fresh_movie_genres)) {
        certified_fresh_movie_genres[genre] = await getCatalog('movie', genre);
        console.log('Movies genre ' + genre + ' catalog done');
    }
    for (const genre of Object.keys(certified_fresh_series_genres)) {
        certified_fresh_series_genres[genre] = await getCatalog('series', genre);
        console.log('Series genre ' + genre + ' catalog done');
    }
    for (const genre of Object.keys(verified_hot_movie_genres)) {
        verified_hot_movie_genres[genre] = await getCatalog('movie:audience', genre);
        console.log('Movies:audience genre ' + genre + ' catalog done');
    }
    for (const genre of Object.keys(verified_hot_series_genres)) {
        verified_hot_series_genres[genre] = await getCatalog('series:audience', genre);
        console.log('Series:audience genre ' + genre + ' catalog done');
    }
    console.log('Done building catalog');
}

function replaceRpdbPosters(catalog, token) {
    return catalog.map((item) => {
        return {
            ...item,
            poster: `https://api.ratingposterdb.com/${token}/imdb/poster-default/${item.id}.jpg`,
        }
    });
}

builder.defineCatalogHandler(async function (args) {
    let genre = args?.extra?.genre;
    if (genre) {
        genre = args.extra.genre.replaceAll(' ', '_').replaceAll('&', 'and').replaceAll('-', '_').replaceAll('+', '').toLowerCase();
    }

    let catalog = [];

    if (args.id === 'rtfresh_movie' && !genre) {
        catalog = certified_fresh_movie_catalog || [];
    }
    if (args.id === 'rtfresh_movie' && genre) {
        catalog = certified_fresh_movie_genres[genre] || []
    }
    if (args.id === 'rtfresh_series' && !genre) {
        catalog = certified_fresh_series_catalog || [];
    }
    if (args.type === 'rtfresh_series' && genre) {
        catalog = certified_fresh_series_genres[genre] || []
    }
    if (args.id === 'rthot_movie' && !genre) {
        catalog = verified_hot_movie_catalog || [];
    }
    if (args.id === 'rthot_movie' && genre) {
        catalog = verified_hot_movie_genres[genre] || []
    }
    if (args.id === 'rthot_series' && !genre) {
        catalog = verified_hot_series_catalog || [];
    }
    if (args.type === 'rthot_series' && genre) {
        catalog = verified_hot_series_genres[genre] || []
    }

    if (args?.config?.rpdb_key) {
        catalog = replaceRpdbPosters(catalog, args.config.rpdb_key);
    }

    return { metas: catalog };
})

main();
