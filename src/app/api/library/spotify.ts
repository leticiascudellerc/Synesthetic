export async function spotifyToken() {
    const id = process.env.SPOTIFY_CLIENT_ID;
    const secret = process.env.SPOTIFY_CLIENT_SECRET!;

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(id + ':' + secret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant-type=client_credentials'
    });
    if (!response.ok) throw new Error('Failed to get Spotify token');
    return response.json() as Promise<{ access_token: string }>;
}