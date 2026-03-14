// ============================================
// Productivity Dashboard - Main Application
// ============================================

// ============================================
// DOM Element References
// ============================================

// Greeting Display Elements
const greetingMessageEl = document.getElementById('greeting-message');
const currentTimeEl = document.getElementById('current-time');
const currentDateEl = document.getElementById('current-date');

// Timer Elements
const timerDisplayEl = document.getElementById('timer-display');
const timerStartBtn = document.getElementById('timer-start');
const timerStopBtn = document.getElementById('timer-stop');
const timerResetBtn = document.getElementById('timer-reset');

// Task Elements
const taskInputEl = document.getElementById('task-input');
const taskAddBtn = document.getElementById('task-add-btn');
const taskListEl = document.getElementById('task-list');

// Link Elements
const linkNameInputEl = document.getElementById('link-name-input');
const linkUrlInputEl = document.getElementById('link-url-input');
const linkAddBtn = document.getElementById('link-add-btn');
const linksContainerEl = document.getElementById('links-container');

// ============================================
// Storage Manager Module
// ============================================

const StorageManager = {
    /**
     * Set a cookie with name, value, and expiration
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {number} days - Expiration in days (default 365)
     */
    setCookie(name, value, days = 365) {
        try {
            // Encode value to handle special characters
            const encodedValue = encodeURIComponent(value);
            
            // Calculate expiration date
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = `expires=${date.toUTCString()}`;
            
            // Set cookie with path and SameSite for security
            document.cookie = `${name}=${encodedValue}; ${expires}; path=/; SameSite=Strict`;
        } catch (error) {
            console.error('Failed to set cookie:', error);
        }
    },

    /**
     * Get a cookie value by name
     * @param {string} name - Cookie name
     * @returns {string|null} Cookie value or null if not found
     */
    getCookie(name) {
        try {
            // Parse document.cookie string
            const nameEQ = name + "=";
            const cookies = document.cookie.split(';');
            
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i];
                // Trim leading spaces
                while (cookie.charAt(0) === ' ') {
                    cookie = cookie.substring(1);
                }
                // Check if this cookie matches the name
                if (cookie.indexOf(nameEQ) === 0) {
                    const value = cookie.substring(nameEQ.length);
                    // Decode value to handle special characters
                    return decodeURIComponent(value);
                }
            }
            return null;
        } catch (error) {
            console.error('Failed to get cookie:', error);
            return null;
        }
    },

    /**
     * Delete a cookie by name
     * @param {string} name - Cookie name
     */
    deleteCookie(name) {
        try {
            // Set cookie with past expiration date to delete it
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
        } catch (error) {
            console.error('Failed to delete cookie:', error);
        }
    },

    /**
     * Save data to cookies with JSON serialization
     * @param {string} key - Storage key
     * @param {any} data - Data to save (will be JSON serialized)
     */
    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            
            // Check if serialized data exceeds 4KB limit
            if (serialized.length > 4096) {
                console.error('Cookie size exceeded (4KB limit). Unable to save data.');
                return;
            }
            
            this.setCookie(key, serialized);
        } catch (error) {
            // Handle cookies unavailable or other errors
            if (error.name === 'SecurityError') {
                console.error('Cookies are unavailable. Data will not persist.');
            } else {
                console.error('Failed to save data to cookies:', error);
            }
        }
    },

    /**
     * Load data from cookies with JSON deserialization
     * @param {string} key - Storage key
     * @returns {any|null} Parsed data or null if not found
     */
    load(key) {
        try {
            const serialized = this.getCookie(key);
            if (serialized === null) {
                return null;
            }
            return JSON.parse(serialized);
        } catch (error) {
            // Handle corrupted cookie data or cookies unavailable
            if (error instanceof SyntaxError) {
                console.error('Corrupted data found in cookie. Clearing key:', key);
                // Clear corrupted data
                this.remove(key);
                return null;
            } else if (error.name === 'SecurityError') {
                console.error('Cookies are unavailable. Cannot load data.');
                return null;
            } else {
                console.error('Failed to load data from cookies:', error);
                return null;
            }
        }
    },

    /**
     * Remove data from cookies
     * @param {string} key - Storage key
     */
    remove(key) {
        this.deleteCookie(key);
    }
};

// ============================================
// Greeting Display Module
// ============================================

const GreetingDisplay = {
    intervalId: null,

    /**
     * Initialize the greeting display component
     */
    init() {
        // Update display immediately
        this.updateDisplay();
        
        // Set up interval to update every second
        this.intervalId = setInterval(() => {
            this.updateDisplay();
        }, 1000);
    },

    /**
     * Update the greeting, time, and date display
     */
    updateDisplay() {
        const now = new Date();
        const hour = now.getHours();
        
        // Update greeting message
        if (greetingMessageEl) {
            greetingMessageEl.textContent = this.getGreeting(hour);
        }
        
        // Update time display
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(now);
        }
        
        // Update date display
        if (currentDateEl) {
            currentDateEl.textContent = this.formatDate(now);
        }
    },

    /**
     * Get greeting message based on hour
     * @param {number} hour - Hour in 24-hour format (0-23)
     * @returns {string} Greeting message
     */
    getGreeting(hour) {
        // 5-11: morning, 12-16: afternoon, 17-20: evening, 21-4: night
        if (hour >= 5 && hour <= 11) {
            return 'Good morning';
        } else if (hour >= 12 && hour <= 16) {
            return 'Good afternoon';
        } else if (hour >= 17 && hour <= 20) {
            return 'Good evening';
        } else {
            // 21-23 or 0-4
            return 'Good night';
        }
    },

    /**
     * Format time in 12-hour format with AM/PM
     * @param {Date} date - Date object
     * @returns {string} Formatted time string
     */
    formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        
        // Determine AM/PM
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        
        // Zero-pad minutes and seconds
        const minutesStr = minutes.toString().padStart(2, '0');
        const secondsStr = seconds.toString().padStart(2, '0');
        
        return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
    },

    /**
     * Format date in readable format
     * @param {Date} date - Date object
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        const dayOfWeek = daysOfWeek[date.getDay()];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        
        return `${dayOfWeek}, ${month} ${day}, ${year}`;
    }
};

// ============================================
// Focus Timer Module
// ============================================

const FocusTimer = {
    remainingSeconds: 1500, // 25 minutes in seconds
    isRunning: false,
    intervalId: null,

    /**
     * Initialize the focus timer component
     */
    init() {
        this.updateDisplay();
        
        // Set up event listeners for timer controls
        if (timerStartBtn) {
            timerStartBtn.addEventListener('click', () => {
                this.start();
            });
        }
        
        if (timerStopBtn) {
            timerStopBtn.addEventListener('click', () => {
                this.stop();
            });
        }
        
        if (timerResetBtn) {
            timerResetBtn.addEventListener('click', () => {
                this.reset();
            });
        }
    },

    /**
     * Start the timer countdown
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.intervalId = setInterval(() => {
                this.tick();
            }, 1000);
        }
    },

    /**
     * Stop/pause the timer
     */
    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            if (this.intervalId !== null) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }
    },

    /**
     * Reset timer to 25 minutes
     */
    reset() {
        this.stop();
        this.remainingSeconds = 1500;
        this.updateDisplay();
    },

    /**
     * Decrement timer by one second
     */
    tick() {
        if (this.remainingSeconds > 0) {
            this.remainingSeconds--;
            this.updateDisplay();
            
            // Auto-stop at 0
            if (this.remainingSeconds === 0) {
                this.stop();
            }
        }
    },

    /**
     * Format seconds to MM:SS format
     * @param {number} seconds - Total seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const minutesStr = minutes.toString().padStart(2, '0');
        const secsStr = secs.toString().padStart(2, '0');
        return `${minutesStr}:${secsStr}`;
    },

    /**
     * Update the timer display
     */
    updateDisplay() {
        if (timerDisplayEl) {
            timerDisplayEl.textContent = this.formatTime(this.remainingSeconds);
        }
    }
};

// ============================================
// Task List Module
// ============================================

const TaskList = {
    tasks: [],

    /**
     * Initialize the task list component
     */
    init() {
        // Load tasks from storage
        this.loadTasks();
        
        // Render tasks to DOM
        this.renderTasks();
        
        // Set up event listeners
        if (taskAddBtn) {
            taskAddBtn.addEventListener('click', () => {
                const text = taskInputEl.value;
                if (this.addTask(text)) {
                    taskInputEl.value = ''; // Clear input on success
                }
            });
        }
        
        // Allow Enter key to add task
        if (taskInputEl) {
            taskInputEl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const text = taskInputEl.value;
                    if (this.addTask(text)) {
                        taskInputEl.value = ''; // Clear input on success
                    }
                }
            });
        }
    },

    /**
     * Add a new task
     * @param {string} text - Task text
     * @returns {boolean} Success status
     */
    addTask(text) {
        // Validate task text
        if (!this.validateTaskText(text)) {
            return false;
        }
        
        // Create new task object
        const task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: text.trim(),
            completed: false,
            createdAt: Date.now()
        };
        
        // Add to tasks array
        this.tasks.push(task);
        
        // Save to storage
        this.saveTasks();
        
        // Re-render tasks
        this.renderTasks();
        
        return true;
    },

    /**
     * Edit an existing task
     * @param {string} id - Task ID
     * @param {string} newText - New task text
     * @returns {boolean} Success status
     */
    editTask(id, newText) {
        // Validate new text
        if (!this.validateTaskText(newText)) {
            return false;
        }
        
        // Find task by id
        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            return false;
        }
        
        // Update task text
        task.text = newText.trim();
        
        // Save to storage
        this.saveTasks();
        
        // Re-render tasks
        this.renderTasks();
        
        return true;
    },

    /**
     * Toggle task completion status
     * @param {string} id - Task ID
     */
    toggleComplete(id) {
        // Find task by id
        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            return;
        }
        
        // Toggle completed status
        task.completed = !task.completed;
        
        // Save to storage
        this.saveTasks();
        
        // Re-render tasks
        this.renderTasks();
    },

    /**
     * Delete a task
     * @param {string} id - Task ID
     */
    deleteTask(id) {
        // Find task index
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) {
            return;
        }
        
        // Remove task from array
        this.tasks.splice(index, 1);
        
        // Save to storage
        this.saveTasks();
        
        // Re-render tasks
        this.renderTasks();
    },

    /**
     * Load tasks from cookies via StorageManager
     */
    loadTasks() {
        const loaded = StorageManager.load('productivity-dashboard-tasks');
        if (loaded && Array.isArray(loaded)) {
            this.tasks = loaded;
        } else {
            this.tasks = [];
        }
    },

    /**
     * Save tasks to cookies via StorageManager
     */
    saveTasks() {
        StorageManager.save('productivity-dashboard-tasks', this.tasks);
    },

    /**
     * Render tasks to the DOM
     */
    renderTasks() {
        if (!taskListEl) {
            return;
        }
        
        // Clear existing tasks
        taskListEl.innerHTML = '';
        
        // Render each task
        this.tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            
            // Checkbox for completion
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                this.toggleComplete(task.id);
            });
            
            // Task text
            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.textContent = task.text;
            
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'task-edit-btn';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => {
                const newText = prompt('Edit task:', task.text);
                if (newText !== null) {
                    this.editTask(task.id, newText);
                }
            });
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'task-delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                this.deleteTask(task.id);
            });
            
            // Assemble task item
            taskItem.appendChild(checkbox);
            taskItem.appendChild(taskText);
            taskItem.appendChild(editBtn);
            taskItem.appendChild(deleteBtn);
            
            taskListEl.appendChild(taskItem);
        });
    },

    /**
     * Validate task text
     * @param {string} text - Task text to validate
     * @returns {boolean} Validation result
     */
    validateTaskText(text) {
        // Check if text is a string
        if (typeof text !== 'string') {
            return false;
        }
        
        // Check if text is non-empty and contains non-whitespace characters
        return text.trim().length > 0;
    }
};

// ============================================
// Quick Links Module
// ============================================

const QuickLinks = {
    links: [],

    /**
     * Initialize the quick links component
     */
    init() {
        // Load links from storage
        this.loadLinks();
        
        // Render links to DOM
        this.renderLinks();
        
        // Set up event listeners
        if (linkAddBtn) {
            linkAddBtn.addEventListener('click', () => {
                const name = linkNameInputEl.value;
                const url = linkUrlInputEl.value;
                if (this.addLink(name, url)) {
                    linkNameInputEl.value = ''; // Clear inputs on success
                    linkUrlInputEl.value = '';
                }
            });
        }
        
        // Allow Enter key to add link
        if (linkUrlInputEl) {
            linkUrlInputEl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const name = linkNameInputEl.value;
                    const url = linkUrlInputEl.value;
                    if (this.addLink(name, url)) {
                        linkNameInputEl.value = ''; // Clear inputs on success
                        linkUrlInputEl.value = '';
                    }
                }
            });
        }
    },

    /**
     * Add a new link
     * @param {string} name - Link display name
     * @param {string} url - Link URL
     * @returns {boolean} Success status
     */
    addLink(name, url) {
        // Validate name (non-empty)
        if (typeof name !== 'string' || name.trim().length === 0) {
            return false;
        }
        
        // Validate URL
        if (!this.validateUrl(url)) {
            return false;
        }
        
        // Create new link object with unique ID
        const link = {
            id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            url: url.trim(),
            createdAt: Date.now()
        };
        
        // Add to links array
        this.links.push(link);
        
        // Save to storage
        this.saveLinks();
        
        // Re-render links
        this.renderLinks();
        
        return true;
    },

    /**
     * Delete a link
     * @param {string} id - Link ID
     */
    deleteLink(id) {
        // Find link index
        const index = this.links.findIndex(l => l.id === id);
        if (index === -1) {
            return;
        }
        
        // Remove link from array
        this.links.splice(index, 1);
        
        // Save to storage
        this.saveLinks();
        
        // Re-render links
        this.renderLinks();
    },

    /**
     * Load links from cookies via StorageManager
     */
    loadLinks() {
        const loaded = StorageManager.load('productivity-dashboard-links');
        if (loaded && Array.isArray(loaded)) {
            this.links = loaded;
        } else {
            this.links = [];
        }
    },

    /**
     * Save links to cookies via StorageManager
     */
    saveLinks() {
        StorageManager.save('productivity-dashboard-links', this.links);
    },

    /**
     * Render links to the DOM
     */
    renderLinks() {
        if (!linksContainerEl) {
            return;
        }
        
        // Clear existing links
        linksContainerEl.innerHTML = '';
        
        // Render each link
        this.links.forEach(link => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            
            // Link button
            const linkBtn = document.createElement('a');
            linkBtn.className = 'link-btn';
            linkBtn.href = link.url;
            linkBtn.target = '_blank'; // Open in new tab
            linkBtn.rel = 'noopener noreferrer'; // Security best practice
            linkBtn.textContent = link.name;
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'link-delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                this.deleteLink(link.id);
            });
            
            // Assemble link item
            linkItem.appendChild(linkBtn);
            linkItem.appendChild(deleteBtn);
            
            linksContainerEl.appendChild(linkItem);
        });
    },

    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean} Validation result
     */
    validateUrl(url) {
        // Check if url is a string
        if (typeof url !== 'string') {
            return false;
        }
        
        // Check if url is non-empty
        const trimmedUrl = url.trim();
        if (trimmedUrl.length === 0) {
            return false;
        }
        
        // Check for http:// or https:// protocol
        return trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
    }
};

// ============================================
// Application Initialization
// ============================================

/**
 * Initialize the entire application
 */
function initApp() {
    // Initialize all components
    GreetingDisplay.init();
    FocusTimer.init();
    TaskList.init();
    QuickLinks.init();
}

// Initialize app when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
