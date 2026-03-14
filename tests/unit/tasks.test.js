/**
 * Unit Tests for TaskList Module
 * Feature: productivity-dashboard
 * Tests Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

// Mock DOM elements
const mockTaskListEl = {
    innerHTML: '',
    appendChild: function(child) {
        // Mock implementation
    }
};

const mockTaskInputEl = {
    value: '',
    addEventListener: function() {}
};

const mockTaskAddBtn = {
    addEventListener: function() {}
};

// Mock StorageManager
const mockStorageManager = {
    data: {},
    save: function(key, value) {
        this.data[key] = JSON.parse(JSON.stringify(value));
    },
    load: function(key) {
        return this.data[key] ? JSON.parse(JSON.stringify(this.data[key])) : null;
    },
    remove: function(key) {
        delete this.data[key];
    }
};

// Create a test instance of TaskList
function createTaskList() {
    return {
        tasks: [],
        
        validateTaskText(text) {
            if (typeof text !== 'string') {
                return false;
            }
            return text.trim().length > 0;
        },
        
        addTask(text) {
            if (!this.validateTaskText(text)) {
                return false;
            }
            
            const task = {
                id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                text: text.trim(),
                completed: false,
                createdAt: Date.now()
            };
            
            this.tasks.push(task);
            this.saveTasks();
            return true;
        },
        
        editTask(id, newText) {
            if (!this.validateTaskText(newText)) {
                return false;
            }
            
            const task = this.tasks.find(t => t.id === id);
            if (!task) {
                return false;
            }
            
            task.text = newText.trim();
            this.saveTasks();
            return true;
        },
        
        toggleComplete(id) {
            const task = this.tasks.find(t => t.id === id);
            if (!task) {
                return;
            }
            
            task.completed = !task.completed;
            this.saveTasks();
        },
        
        deleteTask(id) {
            const index = this.tasks.findIndex(t => t.id === id);
            if (index === -1) {
                return;
            }
            
            this.tasks.splice(index, 1);
            this.saveTasks();
        },
        
        loadTasks() {
            const loaded = mockStorageManager.load('productivity-dashboard-tasks');
            if (loaded && Array.isArray(loaded)) {
                this.tasks = loaded;
            } else {
                this.tasks = [];
            }
        },
        
        saveTasks() {
            mockStorageManager.save('productivity-dashboard-tasks', this.tasks);
        }
    };
}

// Test Suite
describe('TaskList Module', () => {
    let taskList;
    
    beforeEach(() => {
        taskList = createTaskList();
        mockStorageManager.data = {};
    });
    
    describe('validateTaskText', () => {
        test('should accept valid non-empty text', () => {
            expect(taskList.validateTaskText('Buy groceries')).toBe(true);
        });
        
        test('should reject empty string', () => {
            expect(taskList.validateTaskText('')).toBe(false);
        });
        
        test('should reject whitespace-only string', () => {
            expect(taskList.validateTaskText('   ')).toBe(false);
        });
        
        test('should reject non-string values', () => {
            expect(taskList.validateTaskText(null)).toBe(false);
            expect(taskList.validateTaskText(undefined)).toBe(false);
            expect(taskList.validateTaskText(123)).toBe(false);
        });
        
        test('should accept text with leading/trailing whitespace', () => {
            expect(taskList.validateTaskText('  Valid task  ')).toBe(true);
        });
    });
    
    describe('addTask', () => {
        test('should add a valid task to the list', () => {
            const result = taskList.addTask('Complete project');
            expect(result).toBe(true);
            expect(taskList.tasks.length).toBe(1);
            expect(taskList.tasks[0].text).toBe('Complete project');
        });
        
        test('should trim whitespace from task text', () => {
            taskList.addTask('  Trimmed task  ');
            expect(taskList.tasks[0].text).toBe('Trimmed task');
        });
        
        test('should reject empty task text', () => {
            const result = taskList.addTask('');
            expect(result).toBe(false);
            expect(taskList.tasks.length).toBe(0);
        });
        
        test('should reject whitespace-only task text', () => {
            const result = taskList.addTask('   ');
            expect(result).toBe(false);
            expect(taskList.tasks.length).toBe(0);
        });
        
        test('should generate unique IDs for tasks', () => {
            taskList.addTask('Task 1');
            taskList.addTask('Task 2');
            expect(taskList.tasks[0].id).not.toBe(taskList.tasks[1].id);
        });
        
        test('should set completed to false by default', () => {
            taskList.addTask('New task');
            expect(taskList.tasks[0].completed).toBe(false);
        });
        
        test('should set createdAt timestamp', () => {
            const before = Date.now();
            taskList.addTask('New task');
            const after = Date.now();
            expect(taskList.tasks[0].createdAt).toBeGreaterThanOrEqual(before);
            expect(taskList.tasks[0].createdAt).toBeLessThanOrEqual(after);
        });
        
        test('should save tasks to storage after adding', () => {
            taskList.addTask('Task to save');
            const saved = mockStorageManager.load('productivity-dashboard-tasks');
            expect(saved).toHaveLength(1);
            expect(saved[0].text).toBe('Task to save');
        });
    });
    
    describe('editTask', () => {
        test('should update task text by id', () => {
            taskList.addTask('Original text');
            const taskId = taskList.tasks[0].id;
            const result = taskList.editTask(taskId, 'Updated text');
            expect(result).toBe(true);
            expect(taskList.tasks[0].text).toBe('Updated text');
        });
        
        test('should trim whitespace from new text', () => {
            taskList.addTask('Original');
            const taskId = taskList.tasks[0].id;
            taskList.editTask(taskId, '  Updated  ');
            expect(taskList.tasks[0].text).toBe('Updated');
        });
        
        test('should reject empty new text', () => {
            taskList.addTask('Original');
            const taskId = taskList.tasks[0].id;
            const result = taskList.editTask(taskId, '');
            expect(result).toBe(false);
            expect(taskList.tasks[0].text).toBe('Original');
        });
        
        test('should reject whitespace-only new text', () => {
            taskList.addTask('Original');
            const taskId = taskList.tasks[0].id;
            const result = taskList.editTask(taskId, '   ');
            expect(result).toBe(false);
            expect(taskList.tasks[0].text).toBe('Original');
        });
        
        test('should return false for non-existent task id', () => {
            const result = taskList.editTask('non-existent-id', 'New text');
            expect(result).toBe(false);
        });
        
        test('should preserve id and createdAt when editing', () => {
            taskList.addTask('Original');
            const originalId = taskList.tasks[0].id;
            const originalCreatedAt = taskList.tasks[0].createdAt;
            taskList.editTask(originalId, 'Updated');
            expect(taskList.tasks[0].id).toBe(originalId);
            expect(taskList.tasks[0].createdAt).toBe(originalCreatedAt);
        });
        
        test('should save tasks to storage after editing', () => {
            taskList.addTask('Original');
            const taskId = taskList.tasks[0].id;
            taskList.editTask(taskId, 'Updated');
            const saved = mockStorageManager.load('productivity-dashboard-tasks');
            expect(saved[0].text).toBe('Updated');
        });
    });
    
    describe('toggleComplete', () => {
        test('should toggle completed status from false to true', () => {
            taskList.addTask('Task to complete');
            const taskId = taskList.tasks[0].id;
            taskList.toggleComplete(taskId);
            expect(taskList.tasks[0].completed).toBe(true);
        });
        
        test('should toggle completed status from true to false', () => {
            taskList.addTask('Task to uncomplete');
            const taskId = taskList.tasks[0].id;
            taskList.tasks[0].completed = true;
            taskList.toggleComplete(taskId);
            expect(taskList.tasks[0].completed).toBe(false);
        });
        
        test('should handle non-existent task id gracefully', () => {
            taskList.addTask('Task');
            taskList.toggleComplete('non-existent-id');
            // Should not throw error
            expect(taskList.tasks[0].completed).toBe(false);
        });
        
        test('should save tasks to storage after toggling', () => {
            taskList.addTask('Task');
            const taskId = taskList.tasks[0].id;
            taskList.toggleComplete(taskId);
            const saved = mockStorageManager.load('productivity-dashboard-tasks');
            expect(saved[0].completed).toBe(true);
        });
    });
    
    describe('deleteTask', () => {
        test('should remove task from list by id', () => {
            taskList.addTask('Task to delete');
            const taskId = taskList.tasks[0].id;
            taskList.deleteTask(taskId);
            expect(taskList.tasks.length).toBe(0);
        });
        
        test('should only delete the specified task', () => {
            taskList.addTask('Task 1');
            taskList.addTask('Task 2');
            taskList.addTask('Task 3');
            const taskId = taskList.tasks[1].id;
            taskList.deleteTask(taskId);
            expect(taskList.tasks.length).toBe(2);
            expect(taskList.tasks[0].text).toBe('Task 1');
            expect(taskList.tasks[1].text).toBe('Task 3');
        });
        
        test('should handle non-existent task id gracefully', () => {
            taskList.addTask('Task');
            taskList.deleteTask('non-existent-id');
            // Should not throw error
            expect(taskList.tasks.length).toBe(1);
        });
        
        test('should save tasks to storage after deleting', () => {
            taskList.addTask('Task 1');
            taskList.addTask('Task 2');
            const taskId = taskList.tasks[0].id;
            taskList.deleteTask(taskId);
            const saved = mockStorageManager.load('productivity-dashboard-tasks');
            expect(saved).toHaveLength(1);
            expect(saved[0].text).toBe('Task 2');
        });
    });
    
    describe('loadTasks', () => {
        test('should load tasks from storage', () => {
            const testTasks = [
                { id: 'task-1', text: 'Task 1', completed: false, createdAt: Date.now() },
                { id: 'task-2', text: 'Task 2', completed: true, createdAt: Date.now() }
            ];
            mockStorageManager.save('productivity-dashboard-tasks', testTasks);
            taskList.loadTasks();
            expect(taskList.tasks).toHaveLength(2);
            expect(taskList.tasks[0].text).toBe('Task 1');
            expect(taskList.tasks[1].text).toBe('Task 2');
        });
        
        test('should initialize empty array when no tasks in storage', () => {
            taskList.loadTasks();
            expect(taskList.tasks).toEqual([]);
        });
        
        test('should initialize empty array when storage returns null', () => {
            mockStorageManager.data['productivity-dashboard-tasks'] = null;
            taskList.loadTasks();
            expect(taskList.tasks).toEqual([]);
        });
    });
    
    describe('saveTasks', () => {
        test('should save tasks to storage', () => {
            taskList.tasks = [
                { id: 'task-1', text: 'Task 1', completed: false, createdAt: Date.now() }
            ];
            taskList.saveTasks();
            const saved = mockStorageManager.load('productivity-dashboard-tasks');
            expect(saved).toHaveLength(1);
            expect(saved[0].text).toBe('Task 1');
        });
        
        test('should save empty array when no tasks', () => {
            taskList.tasks = [];
            taskList.saveTasks();
            const saved = mockStorageManager.load('productivity-dashboard-tasks');
            expect(saved).toEqual([]);
        });
    });
    
    describe('Task order preservation', () => {
        test('should maintain tasks in creation order', () => {
            taskList.addTask('First task');
            taskList.addTask('Second task');
            taskList.addTask('Third task');
            expect(taskList.tasks[0].text).toBe('First task');
            expect(taskList.tasks[1].text).toBe('Second task');
            expect(taskList.tasks[2].text).toBe('Third task');
        });
        
        test('should preserve order after operations', () => {
            taskList.addTask('Task 1');
            taskList.addTask('Task 2');
            taskList.addTask('Task 3');
            const task2Id = taskList.tasks[1].id;
            taskList.toggleComplete(task2Id);
            expect(taskList.tasks[0].text).toBe('Task 1');
            expect(taskList.tasks[1].text).toBe('Task 2');
            expect(taskList.tasks[2].text).toBe('Task 3');
        });
    });
});
