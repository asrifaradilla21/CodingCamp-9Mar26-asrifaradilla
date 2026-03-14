/**
 * Unit Tests for GreetingDisplay
 * 
 * These tests verify the GreetingDisplay module's functionality including:
 * - Time formatting in 12-hour format with AM/PM
 * - Date formatting in readable format
 * - Greeting message based on hour
 * - Display updates every second
 */

// Load the GreetingDisplay from app.js
const fs = require('fs');
const path = require('path');

// Read and evaluate the app.js file to get GreetingDisplay
const appJsPath = path.join(__dirname, '../../js/app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Extract just the GreetingDisplay module
const greetingDisplayMatch = appJsContent.match(/const GreetingDisplay = \{[\s\S]*?\n\};/);
if (!greetingDisplayMatch) {
    throw new Error('Could not find GreetingDisplay in app.js');
}

// Evaluate the GreetingDisplay code
eval(greetingDisplayMatch[0]);

// Test suite
describe('GreetingDisplay', () => {
    describe('getGreeting()', () => {
        test('should return "Good morning" for hours 5-11', () => {
            expect(GreetingDisplay.getGreeting(5)).toBe('Good morning');
            expect(GreetingDisplay.getGreeting(8)).toBe('Good morning');
            expect(GreetingDisplay.getGreeting(11)).toBe('Good morning');
        });

        test('should return "Good afternoon" for hours 12-16', () => {
            expect(GreetingDisplay.getGreeting(12)).toBe('Good afternoon');
            expect(GreetingDisplay.getGreeting(14)).toBe('Good afternoon');
            expect(GreetingDisplay.getGreeting(16)).toBe('Good afternoon');
        });

        test('should return "Good evening" for hours 17-20', () => {
            expect(GreetingDisplay.getGreeting(17)).toBe('Good evening');
            expect(GreetingDisplay.getGreeting(19)).toBe('Good evening');
            expect(GreetingDisplay.getGreeting(20)).toBe('Good evening');
        });

        test('should return "Good night" for hours 21-23', () => {
            expect(GreetingDisplay.getGreeting(21)).toBe('Good night');
            expect(GreetingDisplay.getGreeting(22)).toBe('Good night');
            expect(GreetingDisplay.getGreeting(23)).toBe('Good night');
        });

        test('should return "Good night" for hours 0-4', () => {
            expect(GreetingDisplay.getGreeting(0)).toBe('Good night');
            expect(GreetingDisplay.getGreeting(2)).toBe('Good night');
            expect(GreetingDisplay.getGreeting(4)).toBe('Good night');
        });

        test('should handle boundary hours correctly', () => {
            expect(GreetingDisplay.getGreeting(4)).toBe('Good night');
            expect(GreetingDisplay.getGreeting(5)).toBe('Good morning');
            expect(GreetingDisplay.getGreeting(11)).toBe('Good morning');
            expect(GreetingDisplay.getGreeting(12)).toBe('Good afternoon');
            expect(GreetingDisplay.getGreeting(16)).toBe('Good afternoon');
            expect(GreetingDisplay.getGreeting(17)).toBe('Good evening');
            expect(GreetingDisplay.getGreeting(20)).toBe('Good evening');
            expect(GreetingDisplay.getGreeting(21)).toBe('Good night');
        });
    });

    describe('formatTime()', () => {
        test('should format time in 12-hour format with AM/PM', () => {
            const date1 = new Date('2024-01-15T09:30:45');
            expect(GreetingDisplay.formatTime(date1)).toBe('9:30:45 AM');

            const date2 = new Date('2024-01-15T15:45:30');
            expect(GreetingDisplay.formatTime(date2)).toBe('3:45:30 PM');
        });

        test('should handle midnight (00:00) as 12:00 AM', () => {
            const date = new Date('2024-01-15T00:00:00');
            expect(GreetingDisplay.formatTime(date)).toBe('12:00:00 AM');
        });

        test('should handle noon (12:00) as 12:00 PM', () => {
            const date = new Date('2024-01-15T12:00:00');
            expect(GreetingDisplay.formatTime(date)).toBe('12:00:00 PM');
        });

        test('should zero-pad minutes and seconds', () => {
            const date = new Date('2024-01-15T03:05:09');
            expect(GreetingDisplay.formatTime(date)).toBe('3:05:09 AM');
        });

        test('should handle 1 AM correctly', () => {
            const date = new Date('2024-01-15T01:00:00');
            expect(GreetingDisplay.formatTime(date)).toBe('1:00:00 AM');
        });

        test('should handle 1 PM correctly', () => {
            const date = new Date('2024-01-15T13:00:00');
            expect(GreetingDisplay.formatTime(date)).toBe('1:00:00 PM');
        });

        test('should handle 11:59:59 AM correctly', () => {
            const date = new Date('2024-01-15T11:59:59');
            expect(GreetingDisplay.formatTime(date)).toBe('11:59:59 AM');
        });

        test('should handle 11:59:59 PM correctly', () => {
            const date = new Date('2024-01-15T23:59:59');
            expect(GreetingDisplay.formatTime(date)).toBe('11:59:59 PM');
        });
    });

    describe('formatDate()', () => {
        test('should format date in readable format with day of week, month, day, and year', () => {
            const date = new Date('2024-01-15T12:00:00');
            expect(GreetingDisplay.formatDate(date)).toBe('Monday, January 15, 2024');
        });

        test('should handle different months correctly', () => {
            const date1 = new Date('2024-02-20T12:00:00');
            expect(GreetingDisplay.formatDate(date1)).toBe('Tuesday, February 20, 2024');

            const date2 = new Date('2024-12-25T12:00:00');
            expect(GreetingDisplay.formatDate(date2)).toBe('Wednesday, December 25, 2024');
        });

        test('should handle different days of week correctly', () => {
            const date1 = new Date('2024-01-14T12:00:00'); // Sunday
            expect(GreetingDisplay.formatDate(date1)).toBe('Sunday, January 14, 2024');

            const date2 = new Date('2024-01-20T12:00:00'); // Saturday
            expect(GreetingDisplay.formatDate(date2)).toBe('Saturday, January 20, 2024');
        });

        test('should handle first day of month', () => {
            const date = new Date('2024-03-01T12:00:00');
            expect(GreetingDisplay.formatDate(date)).toBe('Friday, March 1, 2024');
        });

        test('should handle last day of month', () => {
            const date = new Date('2024-01-31T12:00:00');
            expect(GreetingDisplay.formatDate(date)).toBe('Wednesday, January 31, 2024');
        });

        test('should handle leap year date', () => {
            const date = new Date('2024-02-29T12:00:00');
            expect(GreetingDisplay.formatDate(date)).toBe('Thursday, February 29, 2024');
        });
    });

    describe('init() and updateDisplay()', () => {
        let mockGreetingMessageEl, mockCurrentTimeEl, mockCurrentDateEl;

        beforeEach(() => {
            // Create mock DOM elements
            mockGreetingMessageEl = { textContent: '' };
            mockCurrentTimeEl = { textContent: '' };
            mockCurrentDateEl = { textContent: '' };

            // Mock global DOM elements
            global.greetingMessageEl = mockGreetingMessageEl;
            global.currentTimeEl = mockCurrentTimeEl;
            global.currentDateEl = mockCurrentDateEl;

            // Clear any existing interval
            if (GreetingDisplay.intervalId) {
                clearInterval(GreetingDisplay.intervalId);
                GreetingDisplay.intervalId = null;
            }

            // Mock setInterval
            jest.useFakeTimers();
        });

        afterEach(() => {
            // Clean up
            if (GreetingDisplay.intervalId) {
                clearInterval(GreetingDisplay.intervalId);
                GreetingDisplay.intervalId = null;
            }
            jest.useRealTimers();
        });

        test('should update display immediately on init', () => {
            GreetingDisplay.init();

            // Check that elements were updated
            expect(mockGreetingMessageEl.textContent).toBeTruthy();
            expect(mockCurrentTimeEl.textContent).toBeTruthy();
            expect(mockCurrentDateEl.textContent).toBeTruthy();
        });

        test('should set up interval to update every second', () => {
            GreetingDisplay.init();

            expect(GreetingDisplay.intervalId).not.toBeNull();
            expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
        });

        test('should update display when interval fires', () => {
            GreetingDisplay.init();

            // Clear initial values
            mockGreetingMessageEl.textContent = '';
            mockCurrentTimeEl.textContent = '';
            mockCurrentDateEl.textContent = '';

            // Advance timer by 1 second
            jest.advanceTimersByTime(1000);

            // Check that elements were updated again
            expect(mockGreetingMessageEl.textContent).toBeTruthy();
            expect(mockCurrentTimeEl.textContent).toBeTruthy();
            expect(mockCurrentDateEl.textContent).toBeTruthy();
        });

        test('should handle missing DOM elements gracefully', () => {
            global.greetingMessageEl = null;
            global.currentTimeEl = null;
            global.currentDateEl = null;

            // Should not throw error
            expect(() => {
                GreetingDisplay.updateDisplay();
            }).not.toThrow();
        });
    });
});
