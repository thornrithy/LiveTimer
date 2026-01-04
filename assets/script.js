 let currentMode = 'clock';
 let countdownSeconds = 0;
 let timerInterval = null;
 let isTimerRunning = false;
 let selectedIcon = 'circle-check';
 let todos = [];
 let youtubeVideos = [];
 let currentVideoId = null;

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

 // Load settings from localStorage
 function loadSettings() {
     try {
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

         const font = localStorage.getItem('font');
         if (font) {
             document.getElementById('timeDisplay').style.fontFamily = font;

             // Update active font option
             document.querySelectorAll('.font-option').forEach(el => {
                 if (el.textContent === font) {
                     el.classList.add('active');
                 } else {
                     el.classList.remove('active');
                 }
             });
         }

         const fontSize = localStorage.getItem('fontSize');
         if (fontSize) {
             document.getElementById('timeDisplay').style.fontSize = `${fontSize}px`;
             document.getElementById('fontSizeSlider').value = fontSize;
             document.getElementById('fontSizeValue').textContent = `${fontSize}px`;
         }

         const savedTodos = localStorage.getItem('todos');
         if (savedTodos) {
             todos = JSON.parse(savedTodos);
             renderTodos();
         }

         const savedYoutubeVideos = localStorage.getItem('youtubeVideos');
         if (savedYoutubeVideos) {
             youtubeVideos = JSON.parse(savedYoutubeVideos);
             renderYoutubeVideos();
         }

         // Load sidebar state
         const sidebarState = localStorage.getItem('sidebarOpen');
         if (sidebarState === 'true') {
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

 function updateClock() {
     const now = new Date();
     const timeDisplay = document.getElementById('timeDisplay');
     const dateDisplay = document.getElementById('dateDisplay');

     if (currentMode === 'clock') {
         const hours = String(now.getHours()).padStart(2, '0');
         const minutes = String(now.getMinutes()).padStart(2, '0');
         const seconds = String(now.getSeconds()).padStart(2, '0');
         timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
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
     document.getElementById('timeDisplay').textContent =
         `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

 // Custom timer functions
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

 // YouTube Functions
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
     if (file) {
         const reader = new FileReader();
         reader.onload = function(e) {
             const dataUrl = e.target.result;
             document.getElementById('bgOverlay').style.backgroundImage = `url(${dataUrl})`;
             saveSettings('background', dataUrl);
             document.querySelectorAll('.bg-option').forEach(el => el.classList.remove('active'));
         };
         reader.readAsDataURL(file);
     }
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

 // Event listeners
 document.getElementById('todoToggleBtn').addEventListener('click', toggleTodoSidebar);
 document.getElementById('youtubeToggleBtn').addEventListener('click', toggleYoutubeSidebar);

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

 window.onclick = (event) => {
     const modal = document.getElementById('settingsModal');
     if (event.target === modal) {
         closeSettings();
     }
 };

 // Initialize the app
 loadSettings();
 updateClock();
 setInterval(updateClock, 1000);
 // Mobile-specific optimizations
 function initMobileOptimizations() {
     // Check if device is mobile
     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

     if (isMobile) {
         // Add mobile class to body
         document.body.classList.add('is-mobile');

         // Handle back button to close sidebar
         document.addEventListener('backbutton', handleBackButton, false);

         // Prevent pull-to-refresh on mobile
         document.body.style.overscrollBehavior = 'none';

         // Fix viewport for mobile
         let viewport = document.querySelector('meta[name="viewport"]');
         if (viewport) {
             viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
         }
     }
 }

 function handleBackButton() {
     const todoSidebar = document.getElementById('todoSidebar');
     const youtubeSidebar = document.getElementById('youtubeSidebar');
     const settingsModal = document.getElementById('settingsModal');

     // Close modal first
     if (settingsModal.classList.contains('active')) {
         closeSettings();
         return;
     }

     // Then close sidebars
     if (todoSidebar.classList.contains('open')) {
         toggleTodoSidebar();
         return;
     }

     if (youtubeSidebar.classList.contains('open')) {
         toggleYoutubeSidebar();
         return;
     }
 }

 // Close sidebar when clicking outside on mobile
 function initSidebarCloseOnOutsideClick() {
     document.addEventListener('click', function(event) {
         if (window.innerWidth <= 768) {
             const todoSidebar = document.getElementById('todoSidebar');
             const youtubeSidebar = document.getElementById('youtubeSidebar');
             const mainContainer = document.getElementById('mainContainer');

             const isTodoSidebarOpen = todoSidebar.classList.contains('open');
             const isYoutubeSidebarOpen = youtubeSidebar.classList.contains('open');

             if (isTodoSidebarOpen || isYoutubeSidebarOpen) {
                 // Check if click is outside sidebar
                 const isClickInsideSidebar = todoSidebar.contains(event.target) ||
                     youtubeSidebar.contains(event.target);
                 const isClickOnToggleButton = event.target.closest('#todoToggleBtn') ||
                     event.target.closest('#youtubeToggleBtn');

                 if (!isClickInsideSidebar && !isClickOnToggleButton) {
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

 // Handle orientation changes
 window.addEventListener('orientationchange', function() {
     // Force reflow on orientation change
     setTimeout(function() {
         window.dispatchEvent(new Event('resize'));
         updateClock(); // Update clock to ensure proper display
     }, 300);
 });

 // Initialize mobile optimizations on load
 document.addEventListener('DOMContentLoaded', function() {
     initMobileOptimizations();
     initSidebarCloseOnOutsideClick();

     // Set initial viewport width
     document.documentElement.style.setProperty('--viewport-width', window.innerWidth + 'px');

     // Update on resize
     window.addEventListener('resize', function() {
         document.documentElement.style.setProperty('--viewport-width', window.innerWidth + 'px');
     });
 });

 // Add this to your existing loadSettings function (around line 80)
 // Add after loading other settings:
 if (window.innerWidth <= 768) {
     // Auto-close sidebar if it was open on desktop but now on mobile
     const sidebarState = localStorage.getItem('sidebarOpen');
     if (sidebarState === 'true') {
         // Don't auto-open on mobile for better UX
         localStorage.setItem('sidebarOpen', 'false');
     }
 }