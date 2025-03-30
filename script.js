// Utility function to format time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Save clip to history (using localStorage)
function saveToHistory(clipData) {
    const history = JSON.parse(localStorage.getItem('clipHistory') || '[]');
    history.push({
        ...clipData,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('clipHistory', JSON.stringify(history));
}

// Handle form submission on index.html
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clipForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const videoUrl = document.getElementById('videoUrl').value;
            
            // Basic URL validation
            if (!videoUrl) {
                alert('Please enter a video URL');
                return;
            }

            // Store the URL in localStorage and redirect to clipper page
            localStorage.setItem('currentVideoUrl', videoUrl);
            window.location.href = 'clipper.html';
        });
    }

    // Handle video player functionality on clipper.html
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoPlayer) {
        const timelineSlider = document.getElementById('timelineSlider');
        const currentTimeDisplay = document.getElementById('currentTime');
        const durationDisplay = document.getElementById('duration');
        const startTimeDisplay = document.getElementById('startTimeDisplay');
        const endTimeDisplay = document.getElementById('endTimeDisplay');
        const clipDurationDisplay = document.getElementById('clipDuration');
        const errorMessage = document.getElementById('errorMessage');
        
        let startTime = 0;
        let endTime = 0;

        // Load video from localStorage
        const videoUrl = localStorage.getItem('currentVideoUrl');
        if (videoUrl) {
            videoPlayer.src = videoUrl;
        }

        // Handle video load error
        videoPlayer.addEventListener('error', () => {
            errorMessage.classList.remove('hidden');
        });

        // Update timeline when video loads
        videoPlayer.addEventListener('loadedmetadata', () => {
            timelineSlider.max = Math.floor(videoPlayer.duration);
            durationDisplay.textContent = formatTime(videoPlayer.duration);
            endTime = videoPlayer.duration;
            endTimeDisplay.textContent = formatTime(endTime);
        });

        // Update current time display and slider
        videoPlayer.addEventListener('timeupdate', () => {
            timelineSlider.value = videoPlayer.currentTime;
            currentTimeDisplay.textContent = formatTime(videoPlayer.currentTime);
        });

        // Handle timeline slider change
        timelineSlider.addEventListener('input', () => {
            videoPlayer.currentTime = timelineSlider.value;
        });

        // Set start time
        document.getElementById('setStartTime').addEventListener('click', () => {
            startTime = videoPlayer.currentTime;
            startTimeDisplay.textContent = formatTime(startTime);
            updateClipDuration();
            suggestCaption();
        });

        // Set end time
        document.getElementById('setEndTime').addEventListener('click', () => {
            endTime = videoPlayer.currentTime;
            endTimeDisplay.textContent = formatTime(endTime);
            updateClipDuration();
            suggestCaption();
        });

        // Update clip duration
        function updateClipDuration() {
            const duration = endTime - startTime;
            clipDurationDisplay.textContent = formatTime(Math.max(0, duration));
        }

        // Preview clip
        document.getElementById('previewClip').addEventListener('click', () => {
            if (startTime >= endTime) {
                alert('Please set valid start and end times');
                return;
            }
            videoPlayer.currentTime = startTime;
            videoPlayer.play();
            
            // Stop at end time
            const checkEnd = setInterval(() => {
                if (videoPlayer.currentTime >= endTime) {
                    videoPlayer.pause();
                    clearInterval(checkEnd);
                }
            }, 10);
        });

        // Download clip (simulated)
        document.getElementById('downloadClip').addEventListener('click', () => {
            if (startTime >= endTime) {
                alert('Please set valid start and end times');
                return;
            }
            alert('In a real implementation, this would download the clip from ' + 
                  formatTime(startTime) + ' to ' + formatTime(endTime));
            
            // Save to history
            saveToHistory({
                videoUrl: videoUrl,
                startTime: startTime,
                endTime: endTime,
                caption: document.getElementById('suggestedCaption').textContent
            });
        });

        // Generate suggested caption
        function suggestCaption() {
            if (startTime >= endTime) return;
            
            const suggestedCaptions = [
                "Check out this amazing moment! 🎥✨",
                "You won't believe what happens next! 😮",
                "This is absolutely incredible! 🔥",
                "Watch this awesome clip! 👀",
                "The perfect moment captured! 📸",
                "This will make your day! ❤️",
                "Must-see content right here! 🎬",
                "Sharing this gem with you all! 💎"
            ];
            
            const randomCaption = suggestedCaptions[Math.floor(Math.random() * suggestedCaptions.length)];
            document.getElementById('suggestedCaption').textContent = randomCaption;
        }

        // Regenerate caption
        document.getElementById('regenerateCaption').addEventListener('click', suggestCaption);
    }
});