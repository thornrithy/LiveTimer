// ========== GLOBAL VARIABLES ==========
let currentMode = 'clock';
let countdownSeconds = 0;
let timerInterval = null;
let isTimerRunning = false;
let selectedIcon = 'circle-check';
let todos = [];
let youtubeVideos = [];
let currentVideoId = null;
let timeFormat = 'full';

const backgrounds = {
    gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradient2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    gradient3: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    gradient4: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    gradient5: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    gradient6: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    mountains: 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800)',
    lake: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800)',
    gif1: 'url(https://media.giphy.com/media/l0HlSF6Qa8Qw7W5Y4/giphy.gif)',
    gif2: 'url(https://media.giphy.com/media/3o7aD2s2fC7bV7aRkY/giphy.gif)'
};

// ========== CORE FUNCTIONS ==========

// Load settings from localStorage
function loadSettings() {
    try {
        // Load background
        const bg = localStorage.getItem('background');
        if (bg) {
            if (bg.startsWith('http') || bg.startsWith('data:')) {
                document.getElementById('bgOverlay').style.backgroundImage = `url(${bg})`;
            } else {
                document.getElementById('bgOverlay').style.background = backgrounds[bg] || backgrounds.gradient1;
            }

            // Update active background option
            document.querySelectorAll('.bg-option').forEach(el => {
                if (el.style.background === backgrounds[bg] || el.style.backgroundImage === backgrounds[bg]) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
        }

        // Load time format
        const savedTimeFormat = localStorage.getItem('timeFormat');
        if (savedTimeFormat) {
            timeFormat = savedTimeFormat;
            updateTimeFormatDisplay();
        }

        // Load font settings
        const font = localStorage.getItem('font');
        if (font) {
            document.getElementById('timeDisplay').style.fontFamily = font;

            document.querySelectorAll('.font-option').forEach(el => {
                if (el.textContent === font) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
        }

        // Load font size
        const fontSize = localStorage.getItem('fontSize');
        if (fontSize) {
            document.getElementById('timeDisplay').style.fontSize = `${fontSize}px`;
            document.getElementById('fontSizeSlider').value = fontSize;
            document.getElementById('fontSizeValue').textContent = `${fontSize}px`;
        }

        // Load todos
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
            todos = JSON.parse(savedTodos);
            renderTodos();
        }

        // Load YouTube videos
        const savedYoutubeVideos = localStorage.getItem('youtubeVideos');
        if (savedYoutubeVideos) {
            youtubeVideos = JSON.parse(savedYoutubeVideos);
            renderYoutubeVideos();
        }

        // Load sidebar state
        const sidebarState = localStorage.getItem('sidebarOpen');
        if (sidebarState === 'true' && window.innerWidth > 768) {
            toggleTodoSidebar();
        }
    } catch (e) {
        console.log('No saved settings found, using defaults');
    }
}

// Save settings to localStorage
function saveSettings(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
}

// ========== CLOCK & TIMER FUNCTIONS ==========

function updateClock() {
    const now = new Date();
    const timeDisplay = document.getElementById('timeDisplay');
    const dateDisplay = document.getElementById('dateDisplay');

    if (currentMode === 'clock') {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Apply time format
        if (timeFormat === 'short') {
            timeDisplay.textContent = `${hours}:${minutes}`;
        } else {
            timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    dateDisplay.textContent = now.toLocaleDateString('en-US', options);
}

function setMode(mode) {
    currentMode = mode;
    const buttons = document.querySelectorAll('.mode-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.mode-btn').classList.add('active');

    if (mode === 'countdown' || mode === 'pomodoro') {
        document.getElementById('countdownControls').classList.add('active');
        document.getElementById('customTimerContainer').classList.remove('active');
        if (mode === 'pomodoro') {
            setCountdown(25);
        }
    } else {
        document.getElementById('countdownControls').classList.remove('active');
        document.getElementById('customTimerContainer').classList.remove('active');
        resetTimer();
    }
}

function setCountdown(minutes) {
    countdownSeconds = minutes * 60;
    updateTimerDisplay();
    if (isTimerRunning) {
        toggleTimer();
    }
}

function updateTimerDisplay() {
    const hours = Math.floor(countdownSeconds / 3600);
    const minutes = Math.floor((countdownSeconds % 3600) / 60);
    const seconds = countdownSeconds % 60;

    const timeDisplay = document.getElementById('timeDisplay');

    // Apply time format
    if (timeFormat === 'short') {
        // For short format in countdown mode, still show all if there are hours
        if (hours > 0) {
            timeDisplay.textContent =
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            timeDisplay.textContent =
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    } else {
        timeDisplay.textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

function toggleTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        document.getElementById('timerIcon').className = 'fas fa-play';
    } else {
        timerInterval = setInterval(() => {
            if (countdownSeconds > 0) {
                countdownSeconds--;
                updateTimerDisplay();
            } else {
                toggleTimer();
                alert('Time\'s up!');
            }
        }, 1000);
        document.getElementById('timerIcon').className = 'fas fa-pause';
    }
    isTimerRunning = !isTimerRunning;
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    document.getElementById('timerIcon').className = 'fas fa-play';
    if (currentMode === 'clock') {
        updateClock();
    } else {
        countdownSeconds = 0;
        updateTimerDisplay();
    }
}

// ========== CUSTOM TIMER FUNCTIONS ==========

function setCustomTime() {
    document.getElementById('customTimerContainer').classList.add('active');
    document.getElementById('hoursInput').value = 0;
    document.getElementById('minutesInput').value = 0;
    document.getElementById('secondsInput').value = 0;
}

function applyCustomTime() {
    const hours = parseInt(document.getElementById('hoursInput').value) || 0;
    const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
    const seconds = parseInt(document.getElementById('secondsInput').value) || 0;

    if (hours < 0 || minutes < 0 || seconds < 0) {
        alert('Please enter positive values for time');
        return;
    }

    if (minutes > 59 || seconds > 59) {
        alert('Minutes and seconds cannot exceed 59');
        return;
    }

    countdownSeconds = hours * 3600 + minutes * 60 + seconds;

    if (countdownSeconds === 0) {
        alert('Please set a time greater than 0');
        return;
    }

    updateTimerDisplay();
    document.getElementById('customTimerContainer').classList.remove('active');

    if (isTimerRunning) {
        toggleTimer();
    }
}

function cancelCustomTime() {
    document.getElementById('customTimerContainer').classList.remove('active');
}

// ========== TIME FORMAT FUNCTIONS ==========

function setTimeFormat(format) {
    timeFormat = format;

    // Update active state of format options
    document.querySelectorAll('.format-option').forEach(el => {
        el.classList.remove('active');
    });
    event.target.closest('.format-option').classList.add('active');

    // Save to localStorage
    saveSettings('timeFormat', format);

    // Update the clock display immediately
    updateClock();
}

function updateTimeFormatDisplay() {
    // Update active state of format options
    document.querySelectorAll('.format-option').forEach(el => {
        if (el.dataset.format === timeFormat) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// ========== SIDEBAR FUNCTIONS ==========

function toggleTodoSidebar() {
    const sidebar = document.getElementById('todoSidebar');
    const youtubeSidebar = document.getElementById('youtubeSidebar');
    const mainContainer = document.getElementById('mainContainer');

    // Close YouTube sidebar if open
    if (youtubeSidebar.classList.contains('open')) {
        youtubeSidebar.classList.remove('open');
        mainContainer.classList.remove('sidebar-open');
    }

    const isOpen = sidebar.classList.toggle('open');

    if (isOpen) {
        mainContainer.classList.add('sidebar-open');
    } else {
        mainContainer.classList.remove('sidebar-open');
    }

    // Save sidebar state
    saveSettings('sidebarOpen', isOpen);
}

function toggleYoutubeSidebar() {
    const sidebar = document.getElementById('youtubeSidebar');
    const todoSidebar = document.getElementById('todoSidebar');
    const mainContainer = document.getElementById('mainContainer');

    // Close Todo sidebar if open
    if (todoSidebar.classList.contains('open')) {
        todoSidebar.classList.remove('open');
        mainContainer.classList.remove('sidebar-open');
    }

    const isOpen = sidebar.classList.toggle('open');

    if (isOpen) {
        mainContainer.classList.add('sidebar-open');
    } else {
        mainContainer.classList.remove('sidebar-open');
    }
}

// ========== TODO FUNCTIONS ==========

function selectIcon(element) {
    document.querySelectorAll('.icon-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedIcon = element.dataset.icon;
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (text) {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            icon: selectedIcon
        };
        todos.push(todo);
        input.value = '';
        saveTodos();
        renderTodos();
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

function saveTodos() {
    saveSettings('todos', JSON.stringify(todos));
}

function renderTodos() {
    const list = document.getElementById('todoList');
    const count = document.getElementById('todoCount');

    list.innerHTML = todos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${todo.id})">
            <i class="fas fa-${todo.icon} todo-icon"></i>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                <i class="fas fa-trash"></i>
            </button>
        </li>
    `).join('');

    count.textContent = `${todos.length} task${todos.length !== 1 ? 's' : ''}`;
}

// ========== YOUTUBE FUNCTIONS ==========

function addYouTubeVideo() {
    const input = document.getElementById('youtubeInput');
    const url = input.value.trim();

    if (url) {
        const videoId = extractYouTubeId(url);
        if (videoId) {
            // Get video details using YouTube API
            getVideoDetails(videoId, (videoData) => {
                if (videoData) {
                    const video = {
                        id: videoId,
                        title: videoData.title,
                        channel: videoData.channelTitle,
                        thumbnail: videoData.thumbnails.default.url
                    };
                    youtubeVideos.push(video);
                    input.value = '';
                    saveYoutubeVideos();
                    renderYoutubeVideos();

                    // If this is the first video, play it
                    if (youtubeVideos.length === 1) {
                        playYouTubeVideo(videoId);
                    }
                } else {
                    alert('Could not fetch video details. Please check the URL and try again.');
                }
            });
        } else {
            alert('Please enter a valid YouTube URL');
        }
    }
}

function extractYouTubeId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
}

function getVideoDetails(videoId, callback) {
    // Using a proxy to avoid CORS issues
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyC5INOFf6gH0v9bV7hK6Y4t8Q9Y1lM6y7U`;

    fetch(proxyUrl + apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const snippet = data.items[0].snippet;
                callback({
                    title: snippet.title,
                    channelTitle: snippet.channelTitle,
                    thumbnails: snippet.thumbnails
                });
            } else {
                callback(null);
            }
        })
        .catch(error => {
            console.error('Error fetching video details:', error);
            // Fallback to basic info if API fails
            callback({
                title: 'YouTube Video',
                channelTitle: 'Unknown Channel',
                thumbnails: {
                    default: {
                        url: 'https://img.icons8.com/color/96/youtube-play.png'
                    }
                }
            });
        });
}

function playYouTubeVideo(videoId) {
    const player = document.getElementById('youtubePlayer');
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    currentVideoId = videoId;

    // Update active video in the list
    document.querySelectorAll('.youtube-item').forEach(item => {
        if (item.dataset.videoId === videoId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function deleteYouTubeVideo(videoId) {
    youtubeVideos = youtubeVideos.filter(v => v.id !== videoId);
    saveYoutubeVideos();
    renderYoutubeVideos();

    // If we deleted the currently playing video, stop it
    if (currentVideoId === videoId) {
        const player = document.getElementById('youtubePlayer');
        player.src = '';
        currentVideoId = null;
    }
}

function saveYoutubeVideos() {
    saveSettings('youtubeVideos', JSON.stringify(youtubeVideos));
}

function renderYoutubeVideos() {
    const list = document.getElementById('youtubeList');
    const count = document.getElementById('youtubeCount');

    list.innerHTML = youtubeVideos.map(video => `
        <li class="youtube-item" data-video-id="${video.id}" onclick="playYouTubeVideo('${video.id}')">
            <img src="${video.thumbnail}" class="youtube-thumbnail" alt="${video.title}">
            <div class="youtube-details">
                <div class="youtube-title">${video.title}</div>
                <div class="youtube-channel">${video.channel}</div>
            </div>
            <button class="delete-btn" onclick="event.stopPropagation(); deleteYouTubeVideo('${video.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </li>
    `).join('');

    count.textContent = `${youtubeVideos.length} video${youtubeVideos.length !== 1 ? 's' : ''}`;

    // Mark the current video as active
    if (currentVideoId) {
        const currentVideo = document.querySelector(`.youtube-item[data-video-id="${currentVideoId}"]`);
        if (currentVideo) {
            currentVideo.classList.add('active');
        }
    }
}

// ========== SETTINGS MODAL FUNCTIONS ==========

function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

function setBackground(bg) {
    const bgOverlay = document.getElementById('bgOverlay');

    document.querySelectorAll('.bg-option').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    if (backgrounds[bg]) {
        if (bg.includes('gradient')) {
            bgOverlay.style.background = backgrounds[bg];
            bgOverlay.style.backgroundImage = 'none';
        } else {
            bgOverlay.style.backgroundImage = backgrounds[bg];
        }
        saveSettings('background', bg);
    }
}

function setCustomBackground() {
    const input = document.getElementById('customBgInput');
    const url = input.value.trim();

    if (url) {
        document.getElementById('bgOverlay').style.backgroundImage = `url(${url})`;
        saveSettings('background', url);
        document.querySelectorAll('.bg-option').forEach(el => el.classList.remove('active'));
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];

    if (!file) {
        console.log('No file selected');
        return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP, BMP)');
        event.target.value = ''; // Clear the input
        return;
    }

    // Check file size (max 5MB for mobile)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        alert('File is too large. Please select an image smaller than 5MB.');
        event.target.value = ''; // Clear the input
        return;
    }

    // Show loading message
    const label = event.target.parentElement;
    const originalText = label.innerHTML;
    label.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing image...';

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const dataUrl = e.target.result;

            // Create a test image to verify it loads
            const testImg = new Image();
            testImg.onload = function() {
                // Success - image loaded
                document.getElementById('bgOverlay').style.backgroundImage = `url(${dataUrl})`;
                saveSettings('background', dataUrl);
                document.querySelectorAll('.bg-option').forEach(el => el.classList.remove('active'));

                // Show success message
                label.innerHTML = '<i class="fas fa-check"></i> Image uploaded successfully!';
                setTimeout(() => {
                    label.innerHTML = originalText;
                }, 2000);
            };

            testImg.onerror = function() {
                // Error - image failed to load
                label.innerHTML = originalText;
                alert('Failed to load the image. Please try another file.');
                event.target.value = ''; // Clear the input
            };

            testImg.src = dataUrl;

        } catch (error) {
            console.error('Error processing image:', error);
            label.innerHTML = originalText;
            alert('Error processing the image. Please try again.');
            event.target.value = ''; // Clear the input
        }
    };

    reader.onerror = function() {
        console.error('Error reading file');
        label.innerHTML = originalText;
        alert('Error reading the file. Please try again.');
        event.target.value = ''; // Clear the input
    };

    reader.readAsDataURL(file);
}

function setFont(font) {
    document.querySelectorAll('.font-option').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('timeDisplay').style.fontFamily = font;
    saveSettings('font', font);
}

function updateFontSize(size) {
    document.getElementById('timeDisplay').style.fontSize = `${size}px`;
    document.getElementById('fontSizeValue').textContent = `${size}px`;
    saveSettings('fontSize', size);
}

// ========== MOBILE OPTIMIZATION FUNCTIONS ==========

function initMobileOptimizations() {
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // Add mobile class to body
        document.body.classList.add('is-mobile');

        // Prevent pull-to-refresh on mobile
        document.body.style.overscrollBehavior = 'none';

        // Fix viewport for mobile
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }
}

function initSidebarCloseOnOutsideClick() {
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            const todoSidebar = document.getElementById('todoSidebar');
            const youtubeSidebar = document.getElementById('youtubeSidebar');

            const isTodoSidebarOpen = todoSidebar.classList.contains('open');
            const isYoutubeSidebarOpen = youtubeSidebar.classList.contains('open');

            if (isTodoSidebarOpen || isYoutubeSidebarOpen) {
                // Check if click is outside sidebar
                const isClickInsideSidebar = todoSidebar.contains(event.target) ||
                    youtubeSidebar.contains(event.target);
                const isClickOnToggleButton = event.target.closest('#todoToggleBtn') ||
                    event.target.closest('#youtubeToggleBtn');
                const isClickOnCloseButton = event.target.closest('.sidebar-close-btn');

                if (!isClickInsideSidebar && !isClickOnToggleButton && !isClickOnCloseButton) {
                    if (isTodoSidebarOpen) {
                        toggleTodoSidebar();
                    } else if (isYoutubeSidebarOpen) {
                        toggleYoutubeSidebar();
                    }
                }
            }
        }
    });
}

// ========== EVENT LISTENERS ==========

function setupEventListeners() {
    // Sidebar toggle buttons
    document.getElementById('todoToggleBtn').addEventListener('click', toggleTodoSidebar);
    document.getElementById('youtubeToggleBtn').addEventListener('click', toggleYoutubeSidebar);

    // Enter key for inputs
    document.getElementById('todoInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    document.getElementById('youtubeInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addYouTubeVideo();
        }
    });

    // Close modal when clicking outside
    window.onclick = (event) => {
        const modal = document.getElementById('settingsModal');
        if (event.target === modal) {
            closeSettings();
        }
    };

    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            window.dispatchEvent(new Event('resize'));
            updateClock();
        }, 300);
    });

    // Update viewport width on resize
    window.addEventListener('resize', function() {
        document.documentElement.style.setProperty('--viewport-width', window.innerWidth + 'px');
    });
}

// ========== INITIALIZATION ==========

function initializeApp() {
    // Set initial viewport width
    document.documentElement.style.setProperty('--viewport-width', window.innerWidth + 'px');

    // Load saved settings
    loadSettings();

    // Setup event listeners
    setupEventListeners();

    // Initialize mobile optimizations
    initMobileOptimizations();
    initSidebarCloseOnOutsideClick();

    // Update time format display
    updateTimeFormatDisplay();

    // Start the clock
    updateClock();
    setInterval(updateClock, 1000);
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);