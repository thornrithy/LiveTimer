  let currentMode = 'clock';
  let countdownSeconds = 0;
  let timerInterval = null;
  let isTimerRunning = false;
  let selectedIcon = 'circle-check';
  let todos = [];

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
          if (mode === 'pomodoro') {
              setCountdown(25);
          }
      } else {
          document.getElementById('countdownControls').classList.remove('active');
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

  function toggleTodoSidebar() {
      const sidebar = document.getElementById('todoSidebar');
      const mainContainer = document.getElementById('mainContainer');
      const isOpen = sidebar.classList.toggle('open');

      if (isOpen) {
          mainContainer.classList.add('sidebar-open');
      } else {
          mainContainer.classList.remove('sidebar-open');
      }

      // Save sidebar state
      saveSettings('sidebarOpen', isOpen);
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

  document.getElementById('todoInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
          addTodo();
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