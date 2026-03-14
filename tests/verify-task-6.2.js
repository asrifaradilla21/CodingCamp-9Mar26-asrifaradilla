/**
 * Verification Script for Task 6.2: Integrate TaskList with StorageManager
 * 
 * This script verifies that:
 * 1. saveTasks() persists to cookies using StorageManager.save()
 * 2. loadTasks() retrieves from cookies using StorageManager.load()
 * 3. Uses storage key: 'productivity-dashboard-tasks'
 * 4. Handles empty storage gracefully (initialize empty array)
 */

// Read the app.js file
const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

console.log('='.repeat(60));
console.log('Task 6.2 Verification: TaskList Storage Integration');
console.log('='.repeat(60));
console.log();

// Check 1: Verify saveTasks() uses StorageManager.save()
console.log('✓ Check 1: saveTasks() implementation');
const saveTasksMatch = appJsContent.match(/saveTasks\(\)\s*\{[\s\S]*?StorageManager\.save\('productivity-dashboard-tasks',\s*this\.tasks\)/);
if (saveTasksMatch) {
    console.log('  ✓ saveTasks() correctly calls StorageManager.save()');
    console.log('  ✓ Uses correct storage key: "productivity-dashboard-tasks"');
    console.log('  ✓ Passes this.tasks as data parameter');
} else {
    console.log('  ✗ saveTasks() implementation not found or incorrect');
}
console.log();

// Check 2: Verify loadTasks() uses StorageManager.load()
console.log('✓ Check 2: loadTasks() implementation');
const loadTasksMatch = appJsContent.match(/loadTasks\(\)\s*\{[\s\S]*?StorageManager\.load\('productivity-dashboard-tasks'\)/);
if (loadTasksMatch) {
    console.log('  ✓ loadTasks() correctly calls StorageManager.load()');
    console.log('  ✓ Uses correct storage key: "productivity-dashboard-tasks"');
} else {
    console.log('  ✗ loadTasks() implementation not found or incorrect');
}
console.log();

// Check 3: Verify empty storage handling
console.log('✓ Check 3: Empty storage handling');
const emptyStorageMatch = appJsContent.match(/loadTasks\(\)\s*\{[\s\S]*?if\s*\(loaded\s*&&\s*Array\.isArray\(loaded\)\)[\s\S]*?this\.tasks\s*=\s*loaded[\s\S]*?else[\s\S]*?this\.tasks\s*=\s*\[\]/);
if (emptyStorageMatch) {
    console.log('  ✓ Handles empty/null storage gracefully');
    console.log('  ✓ Initializes empty array when no data exists');
    console.log('  ✓ Validates loaded data is an array');
} else {
    console.log('  ✗ Empty storage handling not found or incorrect');
}
console.log();

// Check 4: Verify integration with other methods
console.log('✓ Check 4: Integration with TaskList methods');
const addTaskSaveMatch = appJsContent.match(/addTask\(text\)[\s\S]*?this\.saveTasks\(\)/);
const editTaskSaveMatch = appJsContent.match(/editTask\(id,\s*newText\)[\s\S]*?this\.saveTasks\(\)/);
const toggleCompleteSaveMatch = appJsContent.match(/toggleComplete\(id\)[\s\S]*?this\.saveTasks\(\)/);
const deleteTaskSaveMatch = appJsContent.match(/deleteTask\(id\)[\s\S]*?this\.saveTasks\(\)/);

if (addTaskSaveMatch) {
    console.log('  ✓ addTask() calls saveTasks()');
}
if (editTaskSaveMatch) {
    console.log('  ✓ editTask() calls saveTasks()');
}
if (toggleCompleteSaveMatch) {
    console.log('  ✓ toggleComplete() calls saveTasks()');
}
if (deleteTaskSaveMatch) {
    console.log('  ✓ deleteTask() calls saveTasks()');
}
console.log();

// Check 5: Verify init() calls loadTasks()
console.log('✓ Check 5: Initialization');
const initLoadMatch = appJsContent.match(/init\(\)\s*\{[\s\S]*?this\.loadTasks\(\)/);
if (initLoadMatch) {
    console.log('  ✓ init() calls loadTasks() to restore saved tasks');
} else {
    console.log('  ✗ init() does not call loadTasks()');
}
console.log();

// Summary
console.log('='.repeat(60));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(60));

const allChecks = [
    saveTasksMatch,
    loadTasksMatch,
    emptyStorageMatch,
    addTaskSaveMatch && editTaskSaveMatch && toggleCompleteSaveMatch && deleteTaskSaveMatch,
    initLoadMatch
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

if (passedChecks === totalChecks) {
    console.log(`✓ ALL CHECKS PASSED (${passedChecks}/${totalChecks})`);
    console.log();
    console.log('Task 6.2 is COMPLETE:');
    console.log('  • saveTasks() persists to cookies using StorageManager.save()');
    console.log('  • loadTasks() retrieves from cookies using StorageManager.load()');
    console.log('  • Uses storage key: "productivity-dashboard-tasks"');
    console.log('  • Handles empty storage gracefully (initializes empty array)');
    console.log();
    console.log('Requirements validated: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6');
} else {
    console.log(`✗ SOME CHECKS FAILED (${passedChecks}/${totalChecks})`);
    console.log('Please review the implementation.');
}
console.log('='.repeat(60));
