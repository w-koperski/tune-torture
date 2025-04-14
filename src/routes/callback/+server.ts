// get action
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {env as envPublic} from '$env/dynamic/public';
import type { RequestHandler } from './$types';
import { Buffer } from 'buffer';
    /*key	Type	Description
access_token	string	An access token that can be provided in subsequent calls, for example to Spotify Web API services.
token_type	string	How the access token may be used: always "Bearer".
scope	string	A space-separated list of scopes which have been granted for this access_token
expires_in	int	The time period (in seconds) for which the access token is valid.
refresh_token	string	See refreshing tokens. */
interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token: string;
}

interface SpotifyErrorResponse {
    error: {
        status: number;
        message: string;
    }
}

export const GET: RequestHandler = async ({ request }) => {
    // exchange code for access token and save to cookie
    const url = new URL(request.url);
    if (url.searchParams.has('error')) {
        return redirect(302, `/?error=${url.searchParams.get('error')}`);
    }
    const code = url.searchParams.get('code');
    if (!code) {
        return redirect(302, '/?error=1&message=No code provided');
    }
    const redirect_uri = `${envPublic.PUBLIC_BASE_URL}/callback`;
    const client_id = env.SPOTIFY_CLIENT_ID;
    const client_secret = env.SPOTIFY_CLIENT_SECRET;
    const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
        },
        body: new URLSearchParams({
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri
        }),
    });

    if (response.status !== 200) {
        const data: SpotifyErrorResponse = await response.json();
        console.log('error', data);
        return redirect(302, `/?error=${data.error.status}&message=${data.error.message}`);
    }
    const data: SpotifyTokenResponse = await response.json();
    // set cookie
    const cookie = `spotify_access_token=${data.access_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${data.expires_in}`;
    const refresh_cookie = `spotify_refresh_token=${data.refresh_token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000`;
    const headers = new Headers();
    headers.append('Set-Cookie', cookie);
    headers.append('Set-Cookie', refresh_cookie);
    headers.append('Location', '/');
    return new Response(null, {
        status: 302,
        // object literal cant have multiple same keys (set-cookie)
        headers,
    });
}