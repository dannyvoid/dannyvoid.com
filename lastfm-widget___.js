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
    const { name: songName, artist: { '#text': artistName }, '@attr': nowPlaying, date } = track;
    const action = nowPlaying ? "🎧 Currently listening to" : "⏸️ Last listened to";

    let message = `${action} <a href="https://last.fm/user/${username}" target="_blank">${artistName} - ${songName}</a>.`;

    if (date) {
        const dateObj = new Date(parseInt(date.uts) * 1000);

        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const formattedTime = dateObj.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        });

        message += ` Played on ${formattedDate} at ${formattedTime}.`;
    }

    return message;
}


async function updateLastFmData() {
    const recentTracks = await fetchLastFmData();

    if (recentTracks.length === 0) {
        displayError("API is currently down.");
        return;
    }

    const latestSong = recentTracks[0];
    const message = formatMessage(latestSong);
    displayMessage(`<strong class="bold-text2">${message}</strong><br /><br />`);
}

function updatePage() {
    updateLastFmData();
    setInterval(updateLastFmData, sleepTime);
}

updatePage();
