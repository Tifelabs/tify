import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = 5500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const getAccessToken = async () => {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            }), {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get access token');
    }
};

app.get('/now-playing', async (req, res) => {
    try {
        const access_token = await getAccessToken();
        const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        if (response.data && response.data.is_playing) {
            res.json({
                song_name: response.data.item.name,
                artist_name: response.data.item.artists.map(artist => artist.name).join(', '),
                album_art: response.data.item.album.images[0].url
            });
        } else {
            res.json({ error: 'No song currently playing' });
        }
    } catch (error) {
        console.error('Error getting currently playing track:', error.response ? error.response.data : error.message);
        res.json({ error: 'Failed to get currently playing track' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
