# Implementation Plan: Productivity Dashboard

## Overview

This plan implements a client-side productivity dashboard using vanilla HTML, CSS, and JavaScript. The implementation follows a component-based architecture with four main features: greeting display, focus timer, task management, and quick links. All data is persisted to browser cookies with no backend dependencies.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create index.html with semantic HTML structure for all components
  - Create css/styles.css file with CSS reset and base styles
  - Create js/app.js file with module structure comments
  - Set up DOM element references and initialization function
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2. Implement Storage Manager
  - [x] 2.1 Create StorageManager module with setCookie, getCookie, deleteCookie, save, load, and remove methods
    - Implement setCookie() with name, value, and expiration days (default 365)
    - Implement getCookie() to parse document.cookie and retrieve values
    - Implement deleteCookie() to remove cookies by setting past expiration
    - Implement save() with JSON serialization and cookie storage
    - Implement load() with cookie retrieval and JSON deserialization
    - Implement remove() using deleteCookie()
    - Add error handling for cookies unavailable and size exceeded (4KB limit)
    - Handle corrupted cookie data gracefully
    - Use encodeURIComponent/decodeURIComponent for special characters
    - Set cookie path to '/' and SameSite=Strict for security
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2_
  
  - [ ]* 2.2 Write property test for storage round-trip consistency
    - **Property 15: Task Storage Round-Trip**
    - **Property 20: Link Storage Round-Trip**
    - **Validates: Requirements 4.5, 6.3**

- [ ] 3. Implement Greeting Display Component
  - [x] 3.1 Create GreetingDisplay module with time/date formatting functions
    - Implement getGreeting() function with hour-based logic (5-11: morning, 12-16: afternoon, 17-20: evening, 21-4: night)
    - Implement formatTime() for 12-hour format with AM/PM
    - Implement formatDate() for readable date format
    - Set up setInterval to update display every second
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [ ] 3.2 Write property tests for greeting display
    - **Property 1: Time Format Validation**
    - **Property 2: Date Format Validation**
    - **Property 3: Greeting Message Correctness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

- [x] 4. Implement Focus Timer Component
  - [x] 4.1 Create FocusTimer module with timer state and controls
    - Initialize timer state (remainingSeconds: 1500, isRunning: false, intervalId: null)
    - Implement start() to begin countdown with setInterval
    - Implement stop() to pause countdown and preserve time
    - Implement reset() to return to 1500 seconds and stop
    - Implement tick() to decrement remainingSeconds and auto-stop at 0
    - Implement formatTime() to convert seconds to MM:SS format
    - Implement updateDisplay() to render timer to DOM
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ]* 4.2 Write property tests for timer operations
    - **Property 4: Timer Format Validation**
    - **Property 5: Timer Start State Transition**
    - **Property 6: Timer Stop Preserves Time**
    - **Property 7: Timer Reset Returns to Initial State**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**

- [x] 5. Checkpoint - Verify greeting and timer functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Task List Component
  - [x] 6.1 Create TaskList module with CRUD operations
    - Initialize tasks array from storage on load
    - Implement addTask() with text validation (non-empty, non-whitespace)
    - Implement editTask() to update task text by id
    - Implement toggleComplete() to flip completed status by id
    - Implement deleteTask() to remove task by id
    - Implement validateTaskText() to check for valid input
    - Generate unique IDs using timestamp or UUID
    - Implement renderTasks() to display tasks in DOM
    - Call saveTasks() after every modification
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [x] 6.2 Integrate TaskList with StorageManager
    - Implement saveTasks() to persist to cookies using StorageManager.save()
    - Implement loadTasks() to retrieve from cookies using StorageManager.load()
    - Use storage key: 'productivity-dashboard-tasks'
    - Handle empty storage gracefully (initialize empty array)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [ ]* 6.3 Write property tests for task operations
    - **Property 8: Task Addition Increases List Size**
    - **Property 9: Task Edit Updates Text**
    - **Property 10: Task Completion Toggle**
    - **Property 11: Task Deletion Removes from List**
    - **Property 12: Task Order Preservation**
    - **Property 13: Invalid Task Rejection**
    - **Property 14: Task Storage Persistence**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4**

- [x] 7. Implement Quick Links Component
  - [x] 7.1 Create QuickLinks module with link management
    - Initialize links array from storage on load
    - Implement addLink() with name and URL validation
    - Implement deleteLink() to remove link by id
    - Implement validateUrl() to check for http:// or https:// protocol
    - Generate unique IDs using timestamp or UUID
    - Implement renderLinks() to display links as clickable buttons
    - Open links in new tab (target="_blank")
    - Call saveLinks() after every modification
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 7.2 Integrate QuickLinks with StorageManager
    - Implement saveLinks() to persist to cookies using StorageManager.save()
    - Implement loadLinks() to retrieve from cookies using StorageManager.load()
    - Use storage key: 'productivity-dashboard-links'
    - Handle empty storage gracefully (initialize empty array)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 7.3 Write property tests for link operations
    - **Property 16: Link Addition Increases List Size**
    - **Property 17: Link Deletion Removes from List**
    - **Property 18: Invalid URL Rejection**
    - **Property 19: Link Storage Persistence**
    - **Validates: Requirements 5.1, 5.3, 5.5, 6.1, 6.2**

- [x] 8. Checkpoint - Verify all components work independently
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement styling and layout
  - [x] 9.1 Create responsive CSS layout
    - Implement consistent color scheme across all components
    - Set minimum font size to 14px for body text
    - Create visual separation between components
    - Position Greeting Display at top of layout
    - Style timer with clear MM:SS display
    - Style task list with checkboxes and edit/delete buttons
    - Style quick links as clickable buttons
    - Add hover and click states for interactive elements
    - Ensure responsive design for different screen sizes
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 10. Integration and initialization
  - [x] 10.1 Wire all components together in app.js
    - Create main initialization function
    - Initialize StorageManager first
    - Initialize all components on DOMContentLoaded
    - Set up event listeners for all user interactions
    - Ensure components load data from cookies on startup
    - Test complete user flow from page load to interaction
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 10.2 Write integration tests
    - Test complete user workflows (add task, complete task, delete task)
    - Test data persistence across page reloads
    - Test cookie size limits with many tasks/links
    - Test error handling for disabled cookies
    - **Validates: Requirements 4.5, 6.3, 8.1, 8.2, 8.3, 8.4, 8.5**

- [x] 11. Final checkpoint - Complete testing and verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify browser compatibility (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
  - Verify performance (load < 1s, interactions < 100ms)
  - Verify cookie persistence across browser sessions

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All data persistence uses browser cookies with 365-day expiration
- Cookie storage keys: 'productivity-dashboard-tasks' and 'productivity-dashboard-links'
- Maximum cookie size is ~4KB per cookie (approximately 50-100 tasks or 30-50 links)