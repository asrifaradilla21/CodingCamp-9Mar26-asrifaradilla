/**
 * Unit Tests for FocusTimer
 * 
 * These tests verify the FocusTimer module's functionality including:
 * - Timer initialization to 1500 seconds (25 minutes)
 * - Start/stop/reset controls
 * - Countdown tick mechanism
 * - Time formatting in MM:SS format
 * - Auto-stop at 0 seconds
 */

// Load the FocusTimer from app.js
const fs = require('fs');
const path = require('path');

// Read and evaluate the app.js file to get FocusTimer
const appJsPath = path.join(__dirname, '../../js/app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Extract just the FocusTimer module
const focusTimerMatch = appJsContent.match(/const FocusTimer = \{[\s\S]*?\n\};/);
if (!focusTimerMatch) {
    throw new Error('Could not find FocusTimer in app.js');
}

// Evaluate the FocusTimer code
eval(focusTimerMatch[0]);

// Test suite
describe('FocusTimer', () => {
    beforeEach(() => {
        // Reset timer state before each test
        FocusTimer.remainingSeconds = 1500;
        FocusTimer.isRunning = false;
        if (FocusTimer.intervalId !== null) {
            clearInterval(FocusTimer.intervalId);
            FocusTimer.intervalId = null;
        }
        jest.useFakeTimers();
    });

    afterEach(() => {
        // Clean up intervals
        if (FocusTimer.intervalId !== null) {
            clearInterval(FocusTimer.intervalId);
            FocusTimer.intervalId = null;
        }
        jest.useRealTimers();
    });

    describe('Initialization', () => {
        test('should initialize with 1500 seconds (25 minutes)', () => {
            expect(FocusTimer.remainingSeconds).toBe(1500);
        });

        test('should initialize with isRunning as false', () => {
            expect(FocusTimer.isRunning).toBe(false);
        });

        test('should initialize with intervalId as null', () => {
            expect(FocusTimer.intervalId).toBe(null);
        });

        test('init() should update display', () => {
            const mockTimerDisplayEl = { textContent: '' };
            global.timerDisplayEl = mockTimerDisplayEl;

            FocusTimer.init();

            expect(mockTimerDisplayEl.textContent).toBe('25:00');
        });
    });

    describe('formatTime()', () => {
        test('should format 1500 seconds as 25:00', () => {
            expect(FocusTimer.formatTime(1500)).toBe('25:00');
        });

        test('should format 0 seconds as 00:00', () => {
            expect(FocusTimer.formatTime(0)).toBe('00:00');
        });

        test('should format 60 seconds as 01:00', () => {
            expect(FocusTimer.formatTime(60)).toBe('01:00');
        });

        test('should format 599 seconds as 09:59', () => {
            expect(FocusTimer.formatTime(599)).toBe('09:59');
        });

        test('should format 1 second as 00:01', () => {
            expect(FocusTimer.formatTime(1)).toBe('00:01');
        });

        test('should format 125 seconds as 02:05', () => {
            expect(FocusTimer.formatTime(125)).toBe('02:05');
        });

        test('should zero-pad minutes and seconds', () => {
            expect(FocusTimer.formatTime(65)).toBe('01:05');
            expect(FocusTimer.formatTime(5)).toBe('00:05');
        });
    });

    describe('start()', () => {
        test('should set isRunning to true', () => {
            FocusTimer.start();
            expect(FocusTimer.isRunning).toBe(true);
        });

        test('should create an interval', () => {
            FocusTimer.start();
            expect(FocusTimer.intervalId).not.toBe(null);
            expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
        });

        test('should preserve remainingSeconds when starting', () => {
            FocusTimer.remainingSeconds = 1200;
            FocusTimer.start();
            expect(FocusTimer.remainingSeconds).toBe(1200);
        });

        test('should not create multiple intervals if already running', () => {
            FocusTimer.start();
            const firstIntervalId = FocusTimer.intervalId;
            FocusTimer.start();
            expect(FocusTimer.intervalId).toBe(firstIntervalId);
        });
    });

    describe('stop()', () => {
        test('should set isRunning to false', () => {
            FocusTimer.start();
            FocusTimer.stop();
            expect(FocusTimer.isRunning).toBe(false);
        });

        test('should clear the interval', () => {
            FocusTimer.start();
            FocusTimer.stop();
            expect(FocusTimer.intervalId).toBe(null);
        });

        test('should preserve remainingSeconds when stopping', () => {
            FocusTimer.remainingSeconds = 1200;
            FocusTimer.start();
            FocusTimer.stop();
            expect(FocusTimer.remainingSeconds).toBe(1200);
        });

        test('should handle stop when not running', () => {
            expect(() => {
                FocusTimer.stop();
            }).not.toThrow();
            expect(FocusTimer.isRunning).toBe(false);
        });
    });

    describe('reset()', () => {
        test('should set remainingSeconds to 1500', () => {
            FocusTimer.remainingSeconds = 500;
            FocusTimer.reset();
            expect(FocusTimer.remainingSeconds).toBe(1500);
        });

        test('should set isRunning to false', () => {
            FocusTimer.start();
            FocusTimer.reset();
            expect(FocusTimer.isRunning).toBe(false);
        });

        test('should clear the interval', () => {
            FocusTimer.start();
            FocusTimer.reset();
            expect(FocusTimer.intervalId).toBe(null);
        });

        test('should update display to 25:00', () => {
            const mockTimerDisplayEl = { textContent: '' };
            global.timerDisplayEl = mockTimerDisplayEl;

            FocusTimer.remainingSeconds = 100;
            FocusTimer.reset();

            expect(mockTimerDisplayEl.textContent).toBe('25:00');
        });
    });

    describe('tick()', () => {
        test('should decrement remainingSeconds by 1', () => {
            const mockTimerDisplayEl = { textContent: '' };
            global.timerDisplayEl = mockTimerDisplayEl;

            FocusTimer.remainingSeconds = 1500;
            FocusTimer.tick();
            expect(FocusTimer.remainingSeconds).toBe(1499);
        });

        test('should update display after tick', () => {
            const mockTimerDisplayEl = { textContent: '' };
            global.timerDisplayEl = mockTimerDisplayEl;

            FocusTimer.remainingSeconds = 125;
            FocusTimer.tick();
            expect(mockTimerDisplayEl.textContent).toBe('02:04');
        });

        test('should stop timer when reaching 0', () => {
            const mockTimerDisplayEl = { textContent: '' };
            global.timerDisplayEl = mockTimerDisplayEl;

            FocusTimer.remainingSeconds = 1;
            FocusTimer.start();
            FocusTimer.tick();

            expect(FocusTimer.remainingSeconds).toBe(0);
            expect(FocusTimer.isRunning).toBe(false);
            expect(FocusTimer.intervalId).toBe(null);
        });

        test('should not decrement below 0', () => {
            const mockTimerDisplayEl = { textContent: '' };
            global.timerDisplayEl = mockTimerDisplayEl;

            FocusTimer.remainingSeconds = 0;
            FocusTimer.tick();
            expect(FocusTimer.remainingSeconds).toBe(0);
        });
    });

    describe('updateDisplay()', () => {
        test('should update timer display element with formatted time', () => {
            const mockTimerDisplayEl = { textContent: '' };
            global.timerDisplayEl = mockTimerDisplayEl;

            FocusTimer.remainingSeconds = 1500;
            FocusTimer.updateDisplay();

            expect(mockTimerDisplayEl.textContent).toBe('25:00');
        });

        test('should handle missing DOM element gracefully', () => {
            global.timerDisplayEl = null;

            expect(() => {
                FocusTimer.updateDisplay();
            }).not.toThrow();
        });
    });

    describe('Integration: Start, Tick, Stop', () => {
        test('should countdown correctly when running', () => {
            const mockTimerDisplayEl = { textContent: '' };
            global.timerDisplayEl = mockTimerDisplayEl;

            FocusTimer.remainingSeconds = 10;
            FocusTimer.start();

            // Advance timer by 3 seconds
            jest.advanceTimersByTime(3000);

            expect(FocusTimer.remainingSeconds).toBe(7);
            expect(FocusTimer.isRunning).toBe(true);
        });

        test('should auto-stop at 0 seconds', () => {
            const mockTimerDisplayEl = { textContent: '' };
            global.timerDisplayEl = mockTimerDisplayEl;

            FocusTimer.remainingSeconds = 2;
            FocusTimer.start();

            // Advance timer by 2 seconds
            jest.advanceTimersByTime(2000);

            expect(FocusTimer.remainingSeconds).toBe(0);
            expect(FocusTimer.isRunning).toBe(false);
            expect(mockTimerDisplayEl.textContent).toBe('00:00');
        });

        test('should allow pause and resume', () => {
            const mockTimerDisplayEl = { textContent: '' };
            global.timerDisplayEl = mockTimerDisplayEl;

            FocusTimer.remainingSeconds = 100;
            FocusTimer.start();

            // Run for 5 seconds
            jest.advanceTimersByTime(5000);
            expect(FocusTimer.remainingSeconds).toBe(95);

            // Pause
            FocusTimer.stop();
            expect(FocusTimer.isRunning).toBe(false);

            // Resume
            FocusTimer.start();
            expect(FocusTimer.isRunning).toBe(true);

            // Run for 5 more seconds
            jest.advanceTimersByTime(5000);
            expect(FocusTimer.remainingSeconds).toBe(90);
        });
    });
});
