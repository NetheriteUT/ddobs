console.log("Daily Dose of Brawl Stars website loaded!");

const YOUTUBE_API_KEY = 'AIzaSyCYe03EHYqxqccfee38Hu_ERf_pu6cqoEA'; 

const CHANNEL_ID = 'UCJRbEJwGiOidbYuqXMOXnZA'; 

async function getUploadsPlaylistId(channelId) {
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    try {
        const response = await fetch(channelUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].contentDetails.relatedPlaylists.uploads;
        } else {
            console.error('Channel not found or no upload playlist.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching channel data:', error);
        return null;
    }
}

async function getVideosFromPlaylist(playlistId, maxResults = 50) {
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    try {
        const response = await fetch(playlistUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error fetching playlist videos:', error);
        return [];
    }
}

function displayVideos(videos) {
    const latestVideoContainer = document.getElementById('latest-video-container');
    const otherVideosGrid = document.getElementById('other-videos-grid');

    if (!videos || videos.length === 0) {
        if (latestVideoContainer) latestVideoContainer.innerHTML = '<p>No videos found.</p>';
        if (otherVideosGrid) otherVideosGrid.innerHTML = '<p>No other videos found.</p>';
        return;
    }

    // Display the latest video (only if on index.html)
    if (latestVideoContainer) {
        const latestVideo = videos[0];
        const latestVideoId = latestVideo.snippet.resourceId.videoId;
        latestVideoContainer.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${latestVideoId}"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen>
            </iframe>
        `;
    }


    
    if (otherVideosGrid) {
        otherVideosGrid.innerHTML = ''; // Clear placeholders
        for (let i = 1; i < videos.length; i++) {
            const video = videos[i];
            const videoId = video.snippet.resourceId.videoId;
            const thumbnailUrl = video.snippet.thumbnails.medium ? video.snippet.thumbnails.medium.url : '';
            const title = video.snippet.title;

            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item');
            videoItem.innerHTML = `
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
                    ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="${title}">` : ''}
                    <h4>${title}</h4>
                </a>
            `;
            otherVideosGrid.appendChild(videoItem);
        }
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    
    const latestVideoContainer = document.getElementById('latest-video-container');
    const otherVideosGrid = document.getElementById('other-videos-grid');

    if (latestVideoContainer || otherVideosGrid) { 
        if (YOUTUBE_API_KEY === 'YOUR_API_KEY') {
            console.warn('YouTube API key not set. Video loading will not work.');
            if (latestVideoContainer) latestVideoContainer.innerHTML = '<p>Please set your YouTube API key in script.js to load videos.</p>';
             if (otherVideosGrid) otherVideosGrid.innerHTML = '<p>Please set your YouTube API key in script.js to load videos.</p>';
            return;
        }

        const uploadsPlaylistId = await getUploadsPlaylistId(CHANNEL_ID);

        if (uploadsPlaylistId) {
            const videos = await getVideosFromPlaylist(uploadsPlaylistId, 10); 
            displayVideos(videos);
        } else {
             if (latestVideoContainer) latestVideoContainer.innerHTML = '<p>Could not retrieve channel upload playlist.</p>';
             if (otherVideosGrid) otherVideosGrid.innerHTML = '<p>Could not retrieve channel upload playlist.</p>';
        }
    }
});
