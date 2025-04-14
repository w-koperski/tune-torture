import { env } from "$env/dynamic/private";

export const load = async ({ request }) => {
    //get refresh token and refresh access token
    const cookie = request.headers.get('cookie');
    const access_token = cookie?.split('; ').find(row => row.startsWith('spotify_access_token='));
    const refresh_token = cookie?.split('; ').find(row => row.startsWith('spotify_refresh_token='));
    if (!refresh_token) {
        return {
            authorized: false
        }
    }
    const token = refresh_token.split('=')[1];
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
            'grant_type': 'refresh_token',
            'refresh_token': token,
        }),
    });
    if (response.status !== 200) {
        const data = await response.json();
        console.log('error', data);
        return {
            authorized: false
        }
    }

    // preffered locale, either en or pl
    const locale = request.headers.get('Accept-Language');
    let preferred_locale = 'en';
    if (locale) {
        const locales = locale.split(',');
        if (locales.length > 0) {
            preferred_locale = locales[0].split('-')[0];
        }
    }
    return {
        authorized: access_token != null,
        preferred_locale
    }

}