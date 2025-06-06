console.log("Daily Dose of Brawl Stars Trivia page loaded!");

const YOUTUBE_API_KEY = 'AIzaSyCYe03EHYqxqccfee38Hu_ERf_pu6cqoEA';
const CHANNEL_ID = 'UCJRbEJwGiOidbYuqXMOXnZA';

document.addEventListener('DOMContentLoaded', async () => {
    const triviaContainer = document.getElementById('trivia-container');
    
    if (!triviaContainer) return;

    if (YOUTUBE_API_KEY === 'YOUR_API_KEY') {
        triviaContainer.innerHTML = '<p>Please set your YouTube API key to load trivia posts.</p>';
        return;
    }

    try {
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(channelUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const channelInfo = data.items[0].snippet;
            
            triviaContainer.innerHTML = '';
            
            const channelInfoCard = document.createElement('div');
            channelInfoCard.classList.add('trivia-card');
            channelInfoCard.innerHTML = `
                <h3>Channel Trivia</h3>
                <img src="${channelInfo.thumbnails.medium.url}" alt="${channelInfo.title}" class="channel-thumbnail">
                <p><strong>Channel Name:</strong> ${channelInfo.title}</p>
                <p><strong>Created:</strong> ${new Date(channelInfo.publishedAt).toLocaleDateString()}</p>
                <p><strong>Description:</strong> ${channelInfo.description || 'No description available.'}</p>
            `;
            triviaContainer.appendChild(channelInfoCard);
            
            await fetchVideosAsTrivia(triviaContainer);
        } else {
            triviaContainer.innerHTML = '<p>No channel information found.</p>';
        }
    } catch (error) {
        console.error('Error fetching channel data:', error);
        triviaContainer.innerHTML = `<p>Error loading trivia: ${error.message}</p>`;
    }
});

async function fetchVideosAsTrivia(container) {
    try {
        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(channelUrl);
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('Channel not found or no upload playlist.');
        }
        
        const uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
        
        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=10&key=${YOUTUBE_API_KEY}`;
        const videoResponse = await fetch(playlistUrl);
        const videoData = await videoResponse.json();
        
        if (!videoData.items || videoData.items.length === 0) {
            throw new Error('No videos found.');
        }
        
        const triviaFactsSection = document.createElement('div');
        triviaFactsSection.classList.add('trivia-section');
        triviaFactsSection.innerHTML = '<h3>Brawl Stars Fun Facts</h3>';
        container.appendChild(triviaFactsSection);
        
        videoData.items.forEach((video, index) => {
            const videoInfo = video.snippet;
            const videoId = videoInfo.resourceId.videoId;
            
            const triviaCard = document.createElement('div');
            triviaCard.classList.add('trivia-card');
            
            const funFact = generateFunFact(videoInfo.title, index);
            
            triviaCard.innerHTML = `
                <div class="trivia-header">
                    <h4>Fun Fact #${index + 1}</h4>
                    <span class="trivia-date">${new Date(videoInfo.publishedAt).toLocaleDateString()}</span>
                </div>
                <div class="trivia-content">
                    <img src="${videoInfo.thumbnails.medium.url}" alt="${videoInfo.title}" class="trivia-thumbnail">
                    <p>${funFact}</p>
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="watch-button">Watch Related Video</a>
                </div>
            `;
            
            triviaFactsSection.appendChild(triviaCard);
        });
        
    } catch (error) {
        console.error('Error fetching videos for trivia:', error);
        container.innerHTML += `<p>Error loading video trivia: ${error.message}</p>`;
    }
}

function generateFunFact(videoTitle, index) {
    const brawlStarsFacts = [
        "Coming Soon",
        "Coming Soon",
        "Coming Soon",
        "Coming Soon",
        "Coming Soon",
        "Coming Soon",
        "Coming Soon",
        "Coming Soon",
        "Coming Soon",
        "Coming Soon"
    ];
    
    if (index < brawlStarsFacts.length) {
        return brawlStarsFacts[index];
    } else {
        return `This episode "${videoTitle}" reveals exciting Brawl Stars secrets and strategies!`;
    }
}
