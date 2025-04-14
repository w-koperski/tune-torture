// get action
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {env as envPublic} from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
    // redirect to spotify auth
    const redirect_uri = `${envPublic.PUBLIC_BASE_URL}/callback`;
    const client_id = env.SPOTIFY_CLIENT_ID;
    const scope = 'user-read-private user-read-email user-top-read user-follow-read';
    const auth_url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`;
    return new Response(null, {
        status: 302,
        headers: {
            Location: auth_url,
        },
    });
}