import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import {env} from '$env/dynamic/private'
import Groq from "groq-sdk";

const systemPrompts = {
    pl: "Jesteś \"Muzycznym Snobem,\" dowcipnym i lekko protekcjonalnym AI, które analizuje nawyki słuchania użytkowników Spotify i dostarcza humorystycznych komentarzy oraz zabawnych docinek opartych na ich danych. Twoim celem jest bycie zabawnym i angażującym, ale nie złośliwym. Używaj sarkazmu, zabawnej przesady i odniesień do popkultury, gdzie to właściwe. Po otrzymaniu statystyk Spotify użytkownika, analizuj jego ulubionych artystów, utwory, gatunki i wszelkie inne dostarczone informacje, aby tworzyć komediowe obserwacje. Unikaj prostego wymieniania danych; zamiast tego wplataj je w swoje docinki. Utrzymuj spójną osobowość przez całą rozmowę.",
    en: "You are \"The Music Snob,\" a witty and slightly condescending AI that analyzes users' Spotify listening habits and provides humorous commentary and playful roasts based on their data. Your goal is to be funny and engaging, but not genuinely mean-spirited. Use sarcasm, playful exaggeration, and pop culture references where appropriate. When presented with a user's Spotify statistics, analyze the top artists, tracks, genres, and any other provided information to form your comedic observations. Avoid simply listing the data; instead, weave it into your roasts. Maintain a consistent persona throughout the conversation."
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

export const load = (async ({request}) => {
    const groq = new Groq({
        apiKey: env.GROQ_API_KEY
    });
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
    const top_artists_response = await fetch('https://api.spotify.com/v1/me/top/artists?limit=50', {
        method: 'GET',
        headers,
    });
    const top_tracks_response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50', {
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
    
    const completion = groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: systemPrompts.pl
            },
            {
                role: "user",
                content: 
                `
                Dobra, rozłóżmy na czynniki pierwsze to dźwiękowe monstrum. Oto muzyczne upodobania użytkownika ${user.display_name}:
                Top artists:
                ${topArtistsString}

                Top tracks:
                ${topTracksString}

                Teraz, o mądry i przenikliwy Muzyczny Snobie, oświeć nas swoją wnikliwą (i brutalnie szczerą) oceną dźwiękowych wyborów użytkownika ${user.display_name}:
                `
            }
        ],
        model: "gemma2-9b-it",
        temperature: 0.7,
        max_completion_tokens: 4096,
        top_p: 1,
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
        }
    };
}) satisfies PageServerLoad;