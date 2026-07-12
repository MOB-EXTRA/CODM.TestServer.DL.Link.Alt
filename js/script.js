// Global tracking variables for the YouTube Player integration
let ytPlayer; // Verification player
let featuredPlayers = []; // Array to hold multiple featured video players
let watchTimer;
let secondsWatched = 0;
const REQUIRED_WATCH_TIME = 60; // Forced 1-minute (60 seconds) watch time threshold

// Dynamically load the official YouTube Iframe API script
(function() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

function loadLinks() {
    const container = document.getElementById("linksContainer");
    const lastUpdated = document.getElementById("lastUpdated");

    try {
        if (typeof testServerData === "undefined") {
            throw new Error("Data not loaded");
        }

        lastUpdated.innerHTML = `
            <i class="fa-solid fa-rocket"></i>
            Last Updated: <strong>${testServerData.lastUpdated}</strong>
        `;

        if (testServerData.status === 1) {
            container.innerHTML = "";

            testServerData.links.forEach((link, index) => {
                container.innerHTML += `
                    <div class="link-box">
                        <div class="link-title">${link.device}</div>
                        <div class="link" id="link${index}">${link.url}</div>
                        <button onclick="copyLink('link${index}', this)">
                             <i class="fa-regular fa-copy"></i> Copy Link
                        </button>
                    </div>
                `;
            });

            showVerification();
        } else {
            container.innerHTML = `
                <div class="server-closed">
                    <h2><i class="fa-solid fa-circle-exclamation"></i> Test Server is Closed</h2>
                    <p>The Call of Duty: Mobile Test Server is currently unavailable.</p>
                    <p>Stay tuned for future updates from the official developers.</p>
                </div>
            `;
        }
    } catch (error) {
        lastUpdated.innerHTML = `<i class="fa-solid fa-rocket"></i> Last Updated: <strong>Unavailable</strong>`;
        
        container.innerHTML = `
            <div class="load-error">
                <h2><i class="fa-solid fa-triangle-exclamation"></i> Unable to Load Download Links</h2>
                <p>The download link data could not be loaded at this time.</p>
                <p>Please refresh the page and try again. If the issue persists, the download link data may be temporarily unavailable.</p>
            </div>
        `;
        console.error(error);
    }
}

function copyLink(id, button) {
    const text = document.getElementById(id).innerText.trim();

    navigator.clipboard
        .writeText(text)
        .then(() => {
            const original = button.innerHTML;
            button.innerHTML = `<i class="fa-solid fa-copy"></i> Copied!`;
            
            setTimeout(() => {
                button.innerHTML = original;
            }, 1500);
        })
        .catch(() => {
            alert("Unable to copy the link.");
        });
}

function showVerification() {
    if (typeof notARobot === "undefined") {
        return;
    }

    // Assign the code source link to the anchor button redirect target
    document.getElementById("videoSource").href = notARobot.codeSource;

    let videoId = "";
    let embedUrl = notARobot.watchSource; // Parse the embedded watch validation video link instead

    if (embedUrl.includes("youtu.be/")) {
        videoId = embedUrl.split("youtu.be/")[1].split("?")[0];
    } else if (embedUrl.includes("watch?v=")) {
        videoId = embedUrl.split("watch?v=")[1].split("&")[0];
    }

    if (window.YT && window.YT.Player) {
        createYTPlayer(videoId);
    } else {
        const existingCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (existingCallback) existingCallback();
            createYTPlayer(videoId);
        };
    }

    document.getElementById("verifyOverlay").style.display = "flex";
    updateButtonTimer();
}

function createYTPlayer(videoId) {
    if (!document.getElementById("videoEmbed")) return;

    ytPlayer = new YT.Player('videoEmbed', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'controls': 1,
            'autoplay': 0,
            'rel': 0
        },
        events: {
            'onStateChange': onPlayerStateChange,
            'onReady': function(e) {
                const iframe = document.getElementById('videoEmbed');
                if (iframe) {
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                }
            }
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        startTrackingTime();
    } else {
        stopTrackingTime();
    }
}

function startTrackingTime() {
    if (watchTimer) return;
    watchTimer = setInterval(() => {
        secondsWatched++;
        updateButtonTimer();
        
        if (secondsWatched >= REQUIRED_WATCH_TIME) {
            stopTrackingTime();
        }
    }, 1000);
}

function stopTrackingTime() {
    clearInterval(watchTimer);
    watchTimer = null;
}

function updateButtonTimer() {
    const unlockBtn = document.getElementById("unlockButton");
    if (!unlockBtn) return;

    if (secondsWatched < REQUIRED_WATCH_TIME) {
        const remaining = REQUIRED_WATCH_TIME - secondsWatched;
        unlockBtn.classList.add("btn-locked");
        unlockBtn.innerHTML = `<i class="fa-solid fa-clock"></i> Watch Video (${remaining}s remaining)`;
    } else {
        unlockBtn.classList.remove("btn-locked");
        unlockBtn.innerHTML = `<i class="fa-solid fa-lock-open"></i> Unlock Links Now`;
    }
}

function unlockLinks() {
    const code = document.getElementById("verifyCode").value.trim();

    if (secondsWatched < REQUIRED_WATCH_TIME) {
        const remaining = REQUIRED_WATCH_TIME - secondsWatched;
        alert(`Verification Protection: Please finish watching the embed video first. You need ${remaining} more seconds.`);
        return;
    }

    if (code === "") {
        alert("Please enter the verification code.");
        return;
    }

    if (code !== notARobot.code) {
        alert("Incorrect verification code.");
        return;
    }

    stopTrackingTime();
    document.getElementById("verifyOverlay").style.display = "none";
}

function waitForData() {
    const container = document.getElementById("linksContainer");
    let dots = 1;

    container.innerHTML = `
        <div class="loading-box">
            <div class="loader"></div>
            <p id="loadingText">Loading official download links.</p>
        </div>
    `;

    const loadingText = document.getElementById("loadingText");
    const loadingAnimation = setInterval(() => {
        loadingText.textContent = "Loading official download links" + ".".repeat(dots);
        dots++;
        
        if (dots > 3) {
            dots = 1;
        }
    }, 300);

    const startTime = Date.now();
    const checkData = setInterval(() => {
        if (typeof testServerData !== "undefined" && typeof notARobot !== "undefined") {
            clearInterval(checkData);

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 1000 - elapsed);

            setTimeout(() => {
                clearInterval(loadingAnimation);
                loadLinks();
            }, remaining);
        }
    }, 100);

    setTimeout(() => {
        if (typeof testServerData === "undefined" || typeof notARobot === "undefined") {
            clearInterval(checkData);
            clearInterval(loadingAnimation);
            loadLinks();
        }
    }, 3000);
}

function loadFeaturedVideos() {
    const section = document.getElementById("featuredVideosSection");

    if (typeof featuredVideos === "undefined" || featuredVideos.length === 0) {
        section.innerHTML = "";
        return;
    }

    let html = `
        <div class="featured-videos">
            <h2 class="section-title">Featured Content</h2>
    `;

    featuredVideos.forEach((video, index) => {
        const match = video.url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/);
        if (!match) return;

        const id = match[1];

        html += `
            <div class="video-card">
                <div class="video-title">${video.title}</div>
                <div class="video-container">
                    <div id="featuredPlayer_${index}" data-video-id="${id}"></div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    section.innerHTML = html;

    if (window.YT && window.YT.Player) {
        initFeaturedPlayers();
    } else {
        const existingCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (existingCallback) existingCallback();
            initFeaturedPlayers();
        };
    }
}

function initFeaturedPlayers() {
    featuredVideos.forEach((video, index) => {
        const elementId = `featuredPlayer_${index}`;
        const targetElement = document.getElementById(elementId);
        if (!targetElement) return;

        const videoId = targetElement.getAttribute('data-video-id');

        const player = new YT.Player(elementId, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'controls': 1,
                'autoplay': 0,
                'rel': 0
            },
            events: {
                'onReady': function(e) {
                    const iframe = document.getElementById(elementId);
                    if (iframe) {
                        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                    }
                }
            }
        });
        
        featuredPlayers.push(player);
    });
}

window.addEventListener("load", () => {
    waitForData();
    loadFeaturedVideos();

    document.getElementById("unlockButton").addEventListener("click", unlockLinks);
    
    document.getElementById("verifyCode").addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            unlockLinks();
        }
    });
});
