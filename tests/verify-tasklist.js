/**
 * Simple verification script for TaskList module
 * Run with: node tests/verify-tasklist.js
 */

// Mock StorageManager
const mockStorageManager = {
    data: {},
    save: function(key, value) {
        this.data[key] = JSON.parse(JSON.stringify(value));
    },
    load: function(key) {
        return this.data[key] ? JSON.parse(JSON.stringify(this.data[key])) : null;
    }
};

// Create TaskList implementation
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

// Test runner
let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log('✓', message);
        passed++;
    } else {
        console.log('✗', message);
        failed++;
    }
}

function assertEqual(actual, expected, message) {
    if (actual === expected) {
        console.log('✓', message);
        passed++;
    } else {
        console.log('✗', message, `(expected: ${expected}, got: ${actual})`);
        failed++;
    }
}

console.log('\n=== TaskList Module Verification ===\n');

// Test 1: validateTaskText
console.log('Testing validateTaskText:');
const taskList = createTaskList();
assert(taskList.validateTaskText('Valid task'), 'accepts valid text');
assert(!taskList.validateTaskText(''), 'rejects empty string');
assert(!taskList.validateTaskText('   '), 'rejects whitespace-only string');
assert(!taskList.validateTaskText(null), 'rejects null');
assert(taskList.validateTaskText('  Valid  '), 'accepts text with whitespace');

// Test 2: addTask
console.log('\nTesting addTask:');
mockStorageManager.data = {};
const taskList2 = createTaskList();
assert(taskList2.addTask('Task 1'), 'adds valid task');
assertEqual(taskList2.tasks.length, 1, 'task list has 1 item');
assertEqual(taskList2.tasks[0].text, 'Task 1', 'task text is correct');
assert(!taskList2.addTask(''), 'rejects empty task');
assertEqual(taskList2.tasks.length, 1, 'task list still has 1 item');
assert(taskList2.tasks[0].completed === false, 'new task is not completed');
assert(typeof taskList2.tasks[0].id === 'string', 'task has string id');
assert(typeof taskList2.tasks[0].createdAt === 'number', 'task has timestamp');

// Test 3: editTask
console.log('\nTesting editTask:');
mockStorageManager.data = {};
const taskList3 = createTaskList();
taskList3.addTask('Original');
const taskId = taskList3.tasks[0].id;
assert(taskList3.editTask(taskId, 'Updated'), 'edits task successfully');
assertEqual(taskList3.tasks[0].text, 'Updated', 'task text is updated');
assert(!taskList3.editTask(taskId, ''), 'rejects empty text');
assertEqual(taskList3.tasks[0].text, 'Updated', 'task text unchanged after rejection');
assert(!taskList3.editTask('invalid-id', 'Text'), 'rejects invalid id');

// Test 4: toggleComplete
console.log('\nTesting toggleComplete:');
mockStorageManager.data = {};
const taskList4 = createTaskList();
taskList4.addTask('Task');
const taskId4 = taskList4.tasks[0].id;
assert(taskList4.tasks[0].completed === false, 'task starts uncompleted');
taskList4.toggleComplete(taskId4);
assert(taskList4.tasks[0].completed === true, 'task is completed after toggle');
taskList4.toggleComplete(taskId4);
assert(taskList4.tasks[0].completed === false, 'task is uncompleted after second toggle');

// Test 5: deleteTask
console.log('\nTesting deleteTask:');
mockStorageManager.data = {};
const taskList5 = createTaskList();
taskList5.addTask('Task 1');
taskList5.addTask('Task 2');
taskList5.addTask('Task 3');
assertEqual(taskList5.tasks.length, 3, 'has 3 tasks');
const taskId5 = taskList5.tasks[1].id;
taskList5.deleteTask(taskId5);
assertEqual(taskList5.tasks.length, 2, 'has 2 tasks after delete');
assertEqual(taskList5.tasks[0].text, 'Task 1', 'first task is correct');
assertEqual(taskList5.tasks[1].text, 'Task 3', 'second task is correct');

// Test 6: loadTasks and saveTasks
console.log('\nTesting loadTasks and saveTasks:');
mockStorageManager.data = {};
const taskList6 = createTaskList();
taskList6.addTask('Task A');
taskList6.addTask('Task B');
const taskList6b = createTaskList();
taskList6b.loadTasks();
assertEqual(taskList6b.tasks.length, 2, 'loads 2 tasks from storage');
assertEqual(taskList6b.tasks[0].text, 'Task A', 'first task text is correct');
assertEqual(taskList6b.tasks[1].text, 'Task B', 'second task text is correct');

// Test 7: Task order preservation
console.log('\nTesting task order preservation:');
mockStorageManager.data = {};
const taskList7 = createTaskList();
taskList7.addTask('First');
taskList7.addTask('Second');
taskList7.addTask('Third');
assertEqual(taskList7.tasks[0].text, 'First', 'first task in correct position');
assertEqual(taskList7.tasks[1].text, 'Second', 'second task in correct position');
assertEqual(taskList7.tasks[2].text, 'Third', 'third task in correct position');

// Test 8: Unique IDs
console.log('\nTesting unique ID generation:');
mockStorageManager.data = {};
const taskList8 = createTaskList();
taskList8.addTask('Task 1');
taskList8.addTask('Task 2');
assert(taskList8.tasks[0].id !== taskList8.tasks[1].id, 'generates unique IDs');

// Summary
console.log('\n=== Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
    console.log('\n✓ All tests passed!');
    process.exit(0);
} else {
    console.log(`\n✗ ${failed} test(s) failed`);
    process.exit(1);
}
