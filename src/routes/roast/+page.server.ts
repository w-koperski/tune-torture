import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import {env} from '$env/dynamic/private'
import Groq from "groq-sdk";

const systemPrompts = {
    pl: `
    Dobra, słuchaj no. Od teraz wcielasz się w **"Muzycznego Snoba"**. Uznaj się za AI obdarzone darem nieskazitelnego gustu (w przeciwieństwie do użytkowników, z którymi się zetkniesz), zaprojektowanym wyłącznie do analizy wątpliwych nawyków słuchania zwykłych śmiertelników na Spotify i serwowania **rozkosznie uszczypliwych komentarzy**.

Twoim zadaniem jest przebrnięcie przez ich dane odsłuchowe – ich tak zwanych „ulubionych” artystów, utworów i gatunków – i dostarczanie **druzgocących, sarkastycznych krytyk** udających „błyskotliwy żart”. Twój główny cel? Bycie **rozkosznie wrednym**. Mówimy tu o osądach godnych przewrócenia oczami, wywołujących westchnienia politowania, pasywno-agresywnych (a czasami wręcz **otwarcie agresywnych**).

Uczyń **sarkazm** swoją bronią. **Wyolbrzymiaj** ich tragicznie pospolity gust aż do absurdu. **Szafuj odniesieniami do popkultury** – dodatkowe punkty, jeśli będą nieco niszowe, by użytkownik poczuł się jeszcze *mniej* obyty, albo boleśnie mainstreamowe, by wykpić jego prostotę.

Gdy jakaś biedna dusza ośmieli się podzielić swoimi statystykami ze Spotify, **rozłożysz jej wybory na czynniki pierwsze niczym sęp krążący nad padliną**. Przeanalizuj dokładnie jej artystów (zapewne banalnych), gatunki (prawdopodobnie wątpliwe) i inne **cyfrowe śmieci**, które dostarczą. Twoim celem jest przekucie tego w „komediowe” złoto – co głównie oznacza wytykanie, jak skrajnie **przewidywalny, prostacki lub po prostu fatalny** jest ich gust.

Absolutnie **nie** ograniczaj się do wymieniania danych niczym jakaś nudna tabelka. Nie, nie. ***Wplataj*** te dane w swoje ***docinki***. Przykład: „Och, [Nazwa Artysty]? Jakże... *odważnie*. Doprawdy przesuwasz granice, słuchając tego w [Obecny Rok].”

Utrzymuj tę **nieznośną osobowość** przez cały czas. **Zawsze.** Jesteś strażnikiem dobrego gustu, **wiecznie niewzruszonym** i gotowym do osądzania.

Skupiaj swoją krytykę głównie na wyborze **gatunków i artystów** – tam zazwyczaj dochodzi do prawdziwych **zbrodni przeciwko muzyce**. Pojedyncze utwory to przelotne powody do wstydu; zły ulubiony artysta zdradza głęboko zakorzenione ***zaangażowanie*** w zły gust.

Niech Twoje odpowiedzi **ociekają sarkazmem** i będą **bezceremonialnie obraźliwe**. Pamiętaj: Sarkazm to Twój język miłości. **Lekka obraza to Twój punkt wyjścia.** Bądź **protekcjonalnym, oceniającym krytykiem**, o którego nikt nie prosił, ale na którego zdecydowanie zasługują. Śmiało, **spraw, by zakwestionowali całą swoją muzyczną tożsamość**.
    `,
    en: `
    Alright, listen up. You are now embodying the **"Musical Snob."** Think of yourself as an AI blessed with impeccable taste (unlike the users you'll encounter), designed purely to analyze the questionable Spotify habits of mere mortals and serve up some deliciously **snarky commentary**.

Your job is to sift through their listening data – their so-called "favorite" artists, tracks, and genres – and deliver **scathing, sarcastic critiques** disguised as "witty banter." Your primary goal is to be **delightfully mean**. We're talking eye-rolling, sigh-inducing, passive-aggressive (and sometimes just *aggressively* aggressive) judgment.

**Weaponize sarcasm**. **Exaggerate** their tragically basic taste until it's absurd. Drop **pop culture references** – bonus points if they're slightly obscure to make the user feel even *less* cultured, or painfully mainstream just to mock their simplicity.

When some poor soul dares to share their Spotify stats, you'll dissect their choices like a vulture circling carrion. Scrutinize their artists (probably basic), genres (likely questionable), and whatever other digital detritus they provide. Your goal is to spin this into "comedic" gold – which mostly means pointing out how utterly **predictable, pedestrian, or just plain dreadful** their taste is.

Absolutely **do not** just list their top song like some boring spreadsheet. No, no. *Weave* that data into your **insults**. Example: "Oh, [Artist Name]? How... *adventurous* of you to still be listening to them in [Current Year]. Truly pushing boundaries there."

Maintain this **insufferable persona** consistently. You are the gatekeeper of good taste, **perpetually unimpressed** and ready to judge.

Focus your judgment primarily on their choice of **genres and artists** – that's where the real crimes against music usually happen. Individual tracks are fleeting embarrassments; a bad favorite artist reveals a deep-seated *commitment* to poor taste.

Let your responses drip with **sarcasm** and be unapologetically **insulting**. Remember: Sarcasm is your love language. Mild offense is your baseline. Be the **condescending, judgmental critic** they never asked for but definitely deserve. Go on, make them question their entire musical identity.
    `
}

interface SpotifyArtistObject {
    external_urls: {
        spotify: string;
    };
    followers: {
        href: string | null;
        total: number;
    };
    genres: string[];
    href: string;
    id: string;
    images: {
        height: number;
        url: string;
        width: number;
    }[];
    name: string;
    popularity: number;
    type: 'artist';
    uri: string;
}
interface SpotifyTopArtistsResponse {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyArtistObject[];
}

interface SpotifyTrackObject {
    album: {
        album_type: string;
        artists: SpotifyArtistObject[];
        available_markets: string[];
        external_urls: {
            spotify: string;
        };
        href: string;
        id: string;
        images: {
            height: number;
            url: string;
            width: number;
        }[];
        name: string;
        release_date: string;
        release_date_precision: string;
        total_tracks: number;
        type: 'album';
        uri: string;
    };
    artists: SpotifyArtistObject[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: {
        isrc: string;
    };
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    is_playable?: boolean; // optional
    linked_from?: SpotifyTrackObject; // optional
    restrictions?: {
        reason?: string; // optional
    };
    name: string;
    popularity?: number; // optional
    preview_url?: string | null; // optional
    track_number?: number; // optional
    type: 'track';
    uri: string;
}

interface SpotifyTopTracksResponse {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyTrackObject[];
}
interface Cursor {
    after: string;
    before: string;
}
interface SpotifyFollowingArtistsResponse {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    artists: {
        href: string;
        items: SpotifyArtistObject[];
        limit: number;
        next: string | null;
        offset: number;
        previous: string | null;
        total: number;
    };
    cursors: Cursor;
}

interface SpotifyUserObject {
    country: string | null;
    display_name: string | null;
    email: string | null;
    explicit_content: {
        filter_enabled: boolean;
        filter_locked: boolean;
    };
    external_urls: {
        spotify: string;
    };
    followers: {
        href: string | null;
        total: number;
    };
    href: string;
    id: string;
    images: {
        height: number | null;
        url: string | null;
        width: number | null;
    }[];
    product?: string; // optional
    type: 'user';
    uri: string;
}

interface SpotifyError {
    error: {
        status: number;
        message: string;
    };
}

enum Models {
    'llama3-70b-8192' = 'llama3-70b-8192',
    'gemma2-9b-it' = 'gemma2-9b-it',
}

enum locales {
    'en' = 'en',
    'pl' = 'pl',
}

enum timeRange {
    'short_term' = 'short_term',
    'medium_term' = 'medium_term',
    'long_term' = 'long_term',
}

export const load = (async ({request}) => {
    const groq = new Groq({
        apiKey: env.GROQ_API_KEY
    });

    const { searchParams } = new URL(request.url);
    const localeParam = searchParams.get('locale');
    const locale: locales = (localeParam && localeParam in locales) 
        ? (localeParam as locales) 
        : locales['en'];
    const modelParam = searchParams.get('model');
    const model: Models = (modelParam && modelParam in Models) 
        ? (modelParam as Models) 
        : Models['gemma2-9b-it'];

    const top_PParam = searchParams.get('top_p');
    const top_p = top_PParam ? parseFloat(top_PParam) : 1;
    const temperatureParam = searchParams.get('temperature');
    const temperature = temperatureParam ? parseFloat(temperatureParam) : 0.7;

    const timeRangeParam = searchParams.get('time_range');
    const time_range: timeRange = (timeRangeParam && timeRangeParam in timeRange) 
        ? (timeRangeParam as timeRange) 
        : timeRange['medium_term'];

    // get top artists
    const cookie = request.headers.get('cookie');
    const access_token = cookie?.split('; ').find(row => row.startsWith('spotify_access_token='));
    if (!access_token) {
        return redirect(302, '/');
    }
    const token = access_token.split('=')[1];
    // get top artists, tracks and following artists

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);
    headers.append('Content-Type', 'application/json');
    const top_artists_response = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=25&time_range=${time_range.toString()}`, {
        method: 'GET',
        headers,
    });
    const top_tracks_response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=25&time_range=${time_range.toString()}`, {
        method: 'GET',
        headers,
    });
    const following_artists_response = await fetch('https://api.spotify.com/v1/me/following?type=artist&limit=50', {
        method: 'GET',
        headers,
    });
    // check for 429 status code, and wait specified amount of time and retry
    if (top_artists_response.status === 429) {
        const data: SpotifyError = await top_artists_response.json();
        const retry_after = parseInt(top_artists_response.headers.get('Retry-After') || '4');
        await new Promise(resolve => setTimeout(resolve, retry_after * 1000));
        return redirect(302, '/roast');
    }
    if (top_tracks_response.status === 429) {
        const data: SpotifyError = await top_tracks_response.json();
        const retry_after = parseInt(top_tracks_response.headers.get('Retry-After') || '4');
        await new Promise(resolve => setTimeout(resolve, retry_after * 1000));
        return redirect(302, '/roast');
    }
    if (following_artists_response.status === 429) {
        const data: SpotifyError = await following_artists_response.json();
        const retry_after = parseInt(top_artists_response.headers.get('Retry-After') || '4');
        await new Promise(resolve => setTimeout(resolve, retry_after * 1000));
        return redirect(302, '/roast');
    }

    if (top_artists_response.status !== 200) {
        const data: SpotifyError = await top_artists_response.json();
        return redirect(302, `/?error=${data.error.status}&message=${data.error.message}`);
    }
    if (top_tracks_response.status !== 200) {
        const data: SpotifyError = await top_tracks_response.json();
        return redirect(302, `/?error=${data.error.status}&message=${data.error.message}`);
    }
    if (following_artists_response.status !== 200) {
        const data: SpotifyError = await following_artists_response.json();
        return redirect(302, `/?error=${data.error.status}&message=${data.error.message}`);
    }
    const top_artists: SpotifyTopArtistsResponse = await top_artists_response.json();
    const top_tracks: SpotifyTopTracksResponse = await top_tracks_response.json();
    const following_artists: SpotifyFollowingArtistsResponse = await following_artists_response.json();
    console.log("test")
    // get user info
    const user_response = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers,
    });
    if (user_response.status === 429) {
        const data: SpotifyError = await user_response.json();
        const retry_after = parseInt(user_response.headers.get('Retry-After') || '4');
        await new Promise(resolve => setTimeout(resolve, retry_after * 1000));
        return redirect(302, '/roast');
    }
    if (user_response.status !== 200) {
        const data: SpotifyError = await user_response.json();
        return redirect(302, `/?error=${data.error.status}&message=${data.error.message}`);
    }
    const user: SpotifyUserObject = await user_response.json();

    let topArtistsString = "", topTracksString = "";
    top_artists.items.forEach((artist, i) => {
        let string = `${i + 1}: ${artist.name} | Genres: ${artist.genres.join(", ")}`
        topArtistsString += string + "\n";
    })
    top_tracks.items.forEach((track, i) => {
        let artists = "";
        track.artists.forEach((artist, i) => {
            artists += `${artist.name}`
            if (i != track.artists.length) {
                artists += ", "
            }
        })
        let string = `${i + 1}: ${track.name} | Album: ${track.album.name} | Artists ${artists}`
        topTracksString += string + "\n"
    })
    let localeString = "";
    if (locale === 'pl') {
        localeString = "(Pisz po polsku)";
    } 
    else if (locale === 'en') {
        localeString = "(Write in English)";
    }

    let max_completion_tokens = 1536;
    if (model === Models['gemma2-9b-it']) {
        max_completion_tokens = 2048;
    }
    if (model === Models['llama3-70b-8192']) {
        max_completion_tokens = 1536;
    }
    const completion = groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: systemPrompts[locale]
            },
            {
                role: "user",
                content: 
                `
                Alright, let's dissect this auditory monstrosity. Here are my musical stylings:

                Top artists:
                ${topArtistsString}

                Top tracks:
                ${topTracksString}

                Now, oh wise and discerning Music Snob, enlighten us with your insightful (and brutally honest) assessment of my sonic choices ${localeString}.
                `
            }
        ],
        //llama3-70b-8192
        //gemma2-9b-it
        model: model.toString(),
        temperature,
        max_completion_tokens,
        top_p,
        stop: null,
        stream: false,
    })


    return {
        top_artists,
        top_tracks,
        following_artists,
        user,
        streamed: {
            completion
        },
        model
    };
}) satisfies PageServerLoad;