const username = "dannyvoid";
const api_key = "b34f8d58e1f90e5fd8d36b1a795c92d5";
const apiUrl = `https://ws.audioscrobbler.com/2.0/`;
const sleepTime = 10000;

const lastFmContainer = $('#lastfm');

function getRecentTracksUrl() {
    return `${apiUrl}?method=user.getRecentTracks&user=${username}&api_key=${api_key}&format=json`;
}

function displayMessage(message) {
    lastFmContainer.html(message);
}

function displayError(message) {
    displayMessage(`<strong class="bold-text2">❌ ${message}</strong><br /><br />`);
}

async function fetchLastFmData() {
    try {
        const response = await fetch(getRecentTracksUrl());
        if (!response.ok) {
            throw new Error("Failed to fetch data from Last.fm API.");
        }
        const data = await response.json();
        return data.recenttracks.track;
    } catch (error) {
        console.error(error);
        displayError("An error occurred while fetching data.");
        return [];
    }
}

function formatMessage(track) {
    const { name: songName, artist: { '#text': artistName }, '@attr': nowPlaying, date, image } = track;
    const isPlaying = !!nowPlaying;
    
    const albumArt = image && image.length > 0 ? image[image.length - 1]['#text'] : '';
    
    let timeString = '';
    if (date) {
        const dateObj = new Date(parseInt(date.uts) * 1000);
        const now = new Date();
        const diffMinutes = Math.floor((now - dateObj) / 60000);
        
        if (diffMinutes < 1) {
            timeString = 'Just now';
        } else if (diffMinutes < 60) {
            timeString = `${diffMinutes}m ago`;
        } else if (diffMinutes < 1440) {
            const hours = Math.floor(diffMinutes / 60);
            timeString = `${hours}h ago`;
        } else {
            const formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            timeString = formattedTime;
        }
    }

    const statusClass = isPlaying ? 'playing' : 'paused';
    const statusText = isPlaying ? 'Now Playing' : 'Last Played';
    
    return `
        <div class="lastfm-card ${statusClass}">
            ${albumArt ? `<div class="lastfm-artwork"><img src="${albumArt}" alt="${songName}" /></div>` : ''}
            <div class="lastfm-content">
                <div class="lastfm-status">
                    <span class="status-indicator"></span>
                    <span class="status-text">${statusText}</span>
                </div>
                <div class="lastfm-track">
                    <a href="https://last.fm/user/${username}" target="_blank" class="track-link">
                        <div class="track-name">${songName}</div>
                        <div class="track-artist">${artistName}</div>
                    </a>
                </div>
                ${timeString ? `<div class="lastfm-time">${timeString}</div>` : ''}
            </div>
        </div>
    `;
}


async function updateLastFmData() {
    const recentTracks = await fetchLastFmData();

    if (recentTracks.length === 0) {
        displayMessage(`
            <div class="lastfm-card error">
                <div class="lastfm-status">
                    <span class="status-text">Unable to load</span>
                </div>
            </div>
        `);
        return;
    }

    const latestSong = recentTracks[0];
    const message = formatMessage(latestSong);
    displayMessage(message);
}

function updatePage() {
    updateLastFmData();
    setInterval(updateLastFmData, sleepTime);
}

updatePage();
