/**
 * Unit Tests for StorageManager
 * 
 * These tests verify the StorageManager module's functionality including:
 * - Setting, getting, and deleting cookies
 * - Saving data to cookies with JSON serialization
 * - Loading data from cookies with JSON deserialization
 * - Removing data from cookies
 * - Error handling for cookies unavailable, size exceeded (4KB), and corrupted data
 */

// Load the StorageManager from app.js
const fs = require('fs');
const path = require('path');

// Read and evaluate the app.js file to get StorageManager
const appJsPath = path.join(__dirname, '../../js/app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Extract just the StorageManager module
const storageManagerMatch = appJsContent.match(/const StorageManager = \{[\s\S]*?\n\};/);
if (!storageManagerMatch) {
    throw new Error('Could not find StorageManager in app.js');
}

// Evaluate the StorageManager code
eval(storageManagerMatch[0]);

// Mock document.cookie for testing
class MockCookieStore {
    constructor() {
        this.cookies = {};
        this.unavailable = false;
    }

    getCookieString() {
        if (this.unavailable) {
            const error = new Error('Cookies unavailable');
            error.name = 'SecurityError';
            throw error;
        }
        return Object.entries(this.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    setCookie(cookieString) {
        if (this.unavailable) {
            const error = new Error('Cookies unavailable');
            error.name = 'SecurityError';
            throw error;
        }
        
        // Parse cookie string
        const parts = cookieString.split(';');
        const [nameValue] = parts;
        const [name, value] = nameValue.split('=');
        
        // Check if this is a delete operation (expires in the past)
        const isDelete = cookieString.includes('expires=Thu, 01 Jan 1970');
        
        if (isDelete) {
            delete this.cookies[name];
        } else {
            this.cookies[name] = value;
        }
    }

    clear() {
        this.cookies = {};
    }
}

let mockCookieStore;

// Test suite
describe('StorageManager', () => {
    beforeEach(() => {
        // Setup mock cookie store
        mockCookieStore = new MockCookieStore();
        
        // Mock document.cookie
        Object.defineProperty(document, 'cookie', {
            get: function() {
                return mockCookieStore.getCookieString();
            },
            set: function(cookieString) {
                mockCookieStore.setCookie(cookieString);
            },
            configurable: true
        });
    });

    afterEach(() => {
        // Clear cookies
        mockCookieStore.clear();
    });

    describe('setCookie()', () => {
        test('should set a cookie with name and value', () => {
            StorageManager.setCookie('test-cookie', 'test-value');
            
            const cookieValue = StorageManager.getCookie('test-cookie');
            expect(cookieValue).toBe('test-value');
        });

        test('should encode special characters in cookie value', () => {
            const specialValue = 'test value with spaces & symbols!';
            StorageManager.setCookie('special-cookie', specialValue);
            
            const cookieValue = StorageManager.getCookie('special-cookie');
            expect(cookieValue).toBe(specialValue);
        });

        test('should set cookie with default 365 days expiration', () => {
            StorageManager.setCookie('default-expiry', 'value');
            
            // Cookie should exist
            expect(StorageManager.getCookie('default-expiry')).toBe('value');
        });

        test('should set cookie with custom expiration days', () => {
            StorageManager.setCookie('custom-expiry', 'value', 30);
            
            // Cookie should exist
            expect(StorageManager.getCookie('custom-expiry')).toBe('value');
        });
    });

    describe('getCookie()', () => {
        test('should retrieve cookie value by name', () => {
            StorageManager.setCookie('test-cookie', 'test-value');
            
            const value = StorageManager.getCookie('test-cookie');
            expect(value).toBe('test-value');
        });

        test('should return null for non-existent cookie', () => {
            const value = StorageManager.getCookie('non-existent');
            expect(value).toBeNull();
        });

        test('should decode special characters from cookie value', () => {
            const specialValue = 'test=value&with=special';
            StorageManager.setCookie('encoded-cookie', specialValue);
            
            const value = StorageManager.getCookie('encoded-cookie');
            expect(value).toBe(specialValue);
        });

        test('should handle multiple cookies correctly', () => {
            StorageManager.setCookie('cookie1', 'value1');
            StorageManager.setCookie('cookie2', 'value2');
            StorageManager.setCookie('cookie3', 'value3');
            
            expect(StorageManager.getCookie('cookie1')).toBe('value1');
            expect(StorageManager.getCookie('cookie2')).toBe('value2');
            expect(StorageManager.getCookie('cookie3')).toBe('value3');
        });
    });

    describe('deleteCookie()', () => {
        test('should delete a cookie by name', () => {
            StorageManager.setCookie('delete-test', 'value');
            expect(StorageManager.getCookie('delete-test')).toBe('value');
            
            StorageManager.deleteCookie('delete-test');
            expect(StorageManager.getCookie('delete-test')).toBeNull();
        });

        test('should not affect other cookies when deleting', () => {
            StorageManager.setCookie('keep1', 'value1');
            StorageManager.setCookie('delete', 'value2');
            StorageManager.setCookie('keep2', 'value3');
            
            StorageManager.deleteCookie('delete');
            
            expect(StorageManager.getCookie('keep1')).toBe('value1');
            expect(StorageManager.getCookie('delete')).toBeNull();
            expect(StorageManager.getCookie('keep2')).toBe('value3');
        });
    });

    describe('save()', () => {
        test('should save data to cookies with JSON serialization', () => {
            const testData = { id: '123', text: 'Test task', completed: false };
            StorageManager.save('test-key', testData);

            const cookieValue = StorageManager.getCookie('test-key');
            expect(cookieValue).toBe(JSON.stringify(testData));
        });

        test('should save array data correctly', () => {
            const testData = [
                { id: '1', text: 'Task 1' },
                { id: '2', text: 'Task 2' }
            ];
            StorageManager.save('test-array', testData);

            const cookieValue = StorageManager.getCookie('test-array');
            expect(cookieValue).toBe(JSON.stringify(testData));
        });

        test('should handle cookie size exceeded (4KB limit)', () => {
            // Create data larger than 4KB
            const largeData = 'x'.repeat(5000);
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            StorageManager.save('large-key', largeData);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Cookie size exceeded (4KB limit)')
            );
            consoleSpy.mockRestore();
        });

        test('should handle cookies unavailable error gracefully', () => {
            mockCookieStore.unavailable = true;
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            StorageManager.save('test-key', { data: 'test' });

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Cookies are unavailable')
            );
            consoleSpy.mockRestore();
        });
    });

    describe('load()', () => {
        test('should load and deserialize data from cookies', () => {
            const testData = { id: '123', text: 'Test task', completed: false };
            StorageManager.save('test-key', testData);

            const loaded = StorageManager.load('test-key');

            expect(loaded).toEqual(testData);
        });

        test('should return null for missing keys', () => {
            const loaded = StorageManager.load('non-existent-key');

            expect(loaded).toBeNull();
        });

        test('should handle corrupted cookie data gracefully', () => {
            StorageManager.setCookie('corrupted-key', 'invalid json {{{');
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const loaded = StorageManager.load('corrupted-key');

            expect(loaded).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Corrupted data found in cookie'),
                'corrupted-key'
            );
            // Verify corrupted data was cleared
            expect(StorageManager.getCookie('corrupted-key')).toBeNull();
            consoleSpy.mockRestore();
        });

        test('should handle cookies unavailable error gracefully', () => {
            mockCookieStore.unavailable = true;
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const loaded = StorageManager.load('test-key');

            expect(loaded).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Cookies are unavailable')
            );
            consoleSpy.mockRestore();
        });
    });

    describe('remove()', () => {
        test('should remove data from cookies', () => {
            StorageManager.save('test-key', { data: 'test' });
            expect(StorageManager.load('test-key')).toEqual({ data: 'test' });

            StorageManager.remove('test-key');

            expect(StorageManager.load('test-key')).toBeNull();
        });

        test('should use deleteCookie internally', () => {
            StorageManager.setCookie('remove-test', 'value');
            
            StorageManager.remove('remove-test');
            
            expect(StorageManager.getCookie('remove-test')).toBeNull();
        });
    });

    describe('Integration scenarios', () => {
        test('should handle save-load-remove cycle correctly', () => {
            const testData = { id: '123', text: 'Test task' };

            // Save
            StorageManager.save('cycle-test', testData);
            
            // Load
            const loaded = StorageManager.load('cycle-test');
            expect(loaded).toEqual(testData);

            // Remove
            StorageManager.remove('cycle-test');
            const afterRemove = StorageManager.load('cycle-test');
            expect(afterRemove).toBeNull();
        });

        test('should handle empty array correctly', () => {
            StorageManager.save('empty-array', []);
            const loaded = StorageManager.load('empty-array');
            expect(loaded).toEqual([]);
        });

        test('should handle null value correctly', () => {
            StorageManager.save('null-value', null);
            const loaded = StorageManager.load('null-value');
            expect(loaded).toBeNull();
        });

        test('should handle complex nested objects', () => {
            const complexData = {
                tasks: [
                    { id: '1', text: 'Task 1', completed: false, createdAt: 1234567890 },
                    { id: '2', text: 'Task 2', completed: true, createdAt: 1234567891 }
                ],
                metadata: {
                    version: '1.0',
                    lastModified: 1234567892
                }
            };

            StorageManager.save('complex-data', complexData);
            const loaded = StorageManager.load('complex-data');
            
            expect(loaded).toEqual(complexData);
        });
    });
});
