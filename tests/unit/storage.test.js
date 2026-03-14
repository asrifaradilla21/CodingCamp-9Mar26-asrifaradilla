/**
 * Unit Tests for StorageManager
 * 
 * These tests verify the StorageManager module's functionality including:
 * - Saving data to Local Storage
 * - Loading data from Local Storage
 * - Removing data from Local Storage
 * - Error handling for storage unavailability, quota exceeded, and corrupted data
 */

// Mock localStorage for testing
class MockLocalStorage {
    constructor() {
        this.store = {};
        this.quotaExceeded = false;
        this.unavailable = false;
    }

    getItem(key) {
        if (this.unavailable) {
            const error = new Error('Local Storage unavailable');
            error.name = 'SecurityError';
            throw error;
        }
        return this.store[key] || null;
    }

    setItem(key, value) {
        if (this.unavailable) {
            const error = new Error('Local Storage unavailable');
            error.name = 'SecurityError';
            throw error;
        }
        if (this.quotaExceeded) {
            const error = new Error('Quota exceeded');
            error.name = 'QuotaExceededError';
            throw error;
        }
        this.store[key] = value;
    }

    removeItem(key) {
        if (this.unavailable) {
            const error = new Error('Local Storage unavailable');
            error.name = 'SecurityError';
            throw error;
        }
        delete this.store[key];
    }

    clear() {
        this.store = {};
    }
}

// Test suite
describe('StorageManager', () => {
    let mockStorage;
    let originalLocalStorage;

    beforeEach(() => {
        // Setup mock localStorage
        mockStorage = new MockLocalStorage();
        originalLocalStorage = global.localStorage;
        global.localStorage = mockStorage;
    });

    afterEach(() => {
        // Restore original localStorage
        global.localStorage = originalLocalStorage;
    });

    describe('save()', () => {
        test('should save data to localStorage with JSON serialization', () => {
            const testData = { id: '123', text: 'Test task', completed: false };
            StorageManager.save('test-key', testData);

            const stored = mockStorage.getItem('test-key');
            expect(stored).toBe(JSON.stringify(testData));
        });

        test('should save array data correctly', () => {
            const testData = [
                { id: '1', text: 'Task 1' },
                { id: '2', text: 'Task 2' }
            ];
            StorageManager.save('test-array', testData);

            const stored = mockStorage.getItem('test-array');
            expect(stored).toBe(JSON.stringify(testData));
        });

        test('should handle quota exceeded error gracefully', () => {
            mockStorage.quotaExceeded = true;
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            StorageManager.save('test-key', { data: 'test' });

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Storage quota exceeded')
            );
            consoleSpy.mockRestore();
        });

        test('should handle storage unavailable error gracefully', () => {
            mockStorage.unavailable = true;
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            StorageManager.save('test-key', { data: 'test' });

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Local Storage is unavailable')
            );
            consoleSpy.mockRestore();
        });
    });

    describe('load()', () => {
        test('should load and deserialize data from localStorage', () => {
            const testData = { id: '123', text: 'Test task', completed: false };
            mockStorage.setItem('test-key', JSON.stringify(testData));

            const loaded = StorageManager.load('test-key');

            expect(loaded).toEqual(testData);
        });

        test('should return null for missing keys', () => {
            const loaded = StorageManager.load('non-existent-key');

            expect(loaded).toBeNull();
        });

        test('should handle corrupted data gracefully', () => {
            mockStorage.setItem('corrupted-key', 'invalid json {{{');
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const loaded = StorageManager.load('corrupted-key');

            expect(loaded).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Corrupted data found'),
                'corrupted-key'
            );
            // Verify corrupted data was cleared
            expect(mockStorage.getItem('corrupted-key')).toBeNull();
            consoleSpy.mockRestore();
        });

        test('should handle storage unavailable error gracefully', () => {
            mockStorage.unavailable = true;
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const loaded = StorageManager.load('test-key');

            expect(loaded).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Local Storage is unavailable')
            );
            consoleSpy.mockRestore();
        });
    });

    describe('remove()', () => {
        test('should remove data from localStorage', () => {
            mockStorage.setItem('test-key', JSON.stringify({ data: 'test' }));

            StorageManager.remove('test-key');

            expect(mockStorage.getItem('test-key')).toBeNull();
        });

        test('should handle storage unavailable error gracefully', () => {
            mockStorage.unavailable = true;
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            StorageManager.remove('test-key');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Local Storage is unavailable')
            );
            consoleSpy.mockRestore();
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
    });
});
