console.log("Daily Dose of Brawl Stars website loaded!");

const YOUTUBE_API_KEY = 'AIzaSyCYe03EHYqxqccfee38Hu_ERf_pu6cqoEA'; 

const CHANNEL_ID = 'UCJRbEJwGiOidbYuqXMOXnZA'; 

let allVideos = [];
let isLoadingMoreVideos = false;
let nextPageToken = null;

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

async function getVideosFromPlaylist(playlistId, maxResults = 50, pageToken = null) {
    let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    
    if (pageToken) {
        playlistUrl += `&pageToken=${pageToken}`;
    }
    
    try {
        const response = await fetch(playlistUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        nextPageToken = data.nextPageToken || null;
        return {
            items: data.items,
            nextPageToken: nextPageToken
        };
    } catch (error) {
        console.error('Error fetching playlist videos:', error);
        return {
            items: [],
            nextPageToken: null
        };
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
        otherVideosGrid.innerHTML = ''; 
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

function createTrophyRoadTimeline(videos) {
    const trophyRoadScroller = document.querySelector('.trophy-road-scroller');
    
    if (!trophyRoadScroller) return;
    
    trophyRoadScroller.innerHTML = '';
    
    const roadLine = document.createElement('div');
    roadLine.classList.add('road-line');
    trophyRoadScroller.appendChild(roadLine);
    
    videos.forEach((video, index) => {
        const videoId = video.snippet.resourceId.videoId;
        const thumbnailUrl = video.snippet.thumbnails.medium ? video.snippet.thumbnails.medium.url : '';
        const title = video.snippet.title;
        
        const publishedAt = new Date(video.snippet.publishedAt);
        const formattedDate = publishedAt.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const episodeNode = document.createElement('div');
        episodeNode.classList.add('episode-node');
        episodeNode.setAttribute('data-number', formattedDate);
        
        episodeNode.innerHTML = `
            <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
                <img src="${thumbnailUrl}" alt="${title}">
                <div class="episode-title">${title}</div>
                <div class="episode-date">${formattedDate}</div>
            </a>
        `;
        
        trophyRoadScroller.appendChild(episodeNode);
    });
}

function handleTrophyRoadScroll() {
    const trophyRoadScroller = document.querySelector('.trophy-road-scroller');
    
    if (!trophyRoadScroller) return;
    
    trophyRoadScroller.addEventListener('scroll', async () => {
        const { scrollLeft, scrollWidth, clientWidth } = trophyRoadScroller;
        
        if (scrollLeft + clientWidth >= scrollWidth - 200 && nextPageToken && !isLoadingMoreVideos) {
            isLoadingMoreVideos = true;
            
            const loadingIndicator = document.createElement('div');
            loadingIndicator.classList.add('loading-indicator');
            loadingIndicator.textContent = 'Loading more...';
            trophyRoadScroller.appendChild(loadingIndicator);
            
            const uploadsPlaylistId = await getUploadsPlaylistId(CHANNEL_ID);
            const videoData = await getVideosFromPlaylist(uploadsPlaylistId, 10, nextPageToken);
            
            trophyRoadScroller.removeChild(loadingIndicator);
            
            allVideos = [...allVideos, ...videoData.items];
            
            createTrophyRoadTimeline(allVideos);
            
            isLoadingMoreVideos = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const latestVideoContainer = document.getElementById('latest-video-container');
    const otherVideosGrid = document.getElementById('other-videos-grid');
    const trophyRoadScroller = document.querySelector('.trophy-road-scroller');

    if (latestVideoContainer || otherVideosGrid || trophyRoadScroller) {
        if (YOUTUBE_API_KEY === 'YOUR_API_KEY') {
            console.warn('YouTube API key not set. Video loading will not work.');
            if (latestVideoContainer) latestVideoContainer.innerHTML = '<p>Please set your YouTube API key in script.js to load videos.</p>';
            if (otherVideosGrid) otherVideosGrid.innerHTML = '<p>Please set your YouTube API key in script.js to load videos.</p>';
            if (trophyRoadScroller) trophyRoadScroller.innerHTML = '<p>Please set your YouTube API key in script.js to load videos.</p>';
            return;
        }

        const uploadsPlaylistId = await getUploadsPlaylistId(CHANNEL_ID);

        if (uploadsPlaylistId) {
            if (latestVideoContainer || otherVideosGrid) {
                const videoData = await getVideosFromPlaylist(uploadsPlaylistId, 10);
                displayVideos(videoData.items);
            }
            
            if (trophyRoadScroller) {
                const videoData = await getVideosFromPlaylist(uploadsPlaylistId, 20);
                allVideos = videoData.items;
                createTrophyRoadTimeline(allVideos);
                handleTrophyRoadScroll();
            }
        } else {
            if (latestVideoContainer) latestVideoContainer.innerHTML = '<p>Could not retrieve channel upload playlist.</p>';
            if (otherVideosGrid) otherVideosGrid.innerHTML = '<p>Could not retrieve channel upload playlist.</p>';
            if (trophyRoadScroller) trophyRoadScroller.innerHTML = '<p>Could not retrieve channel upload playlist.</p>';
        }
    }
});
