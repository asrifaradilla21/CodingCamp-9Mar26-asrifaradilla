/**
 * Manual verification script for QuickLinks module
 * This script tests the QuickLinks implementation without Jest
 */

console.log('=== QuickLinks Module Verification ===\n');

// Mock DOM elements
const mockDOM = {
    linksContainer: { innerHTML: '', appendChild: () => {}, querySelectorAll: () => [] },
    nameInput: { value: '' },
    urlInput: { value: '' },
    addBtn: { addEventListener: () => {} }
};

// Test 1: validateUrl
console.log('Test 1: validateUrl');
console.log('  ✓ Valid https URL:', QuickLinks.validateUrl('https://github.com') === true);
console.log('  ✓ Valid http URL:', QuickLinks.validateUrl('http://example.com') === true);
console.log('  ✓ Reject no protocol:', QuickLinks.validateUrl('example.com') === false);
console.log('  ✓ Reject empty:', QuickLinks.validateUrl('') === false);
console.log('  ✓ Reject whitespace:', QuickLinks.validateUrl('   ') === false);
console.log('  ✓ Reject null:', QuickLinks.validateUrl(null) === false);

// Test 2: addLink
console.log('\nTest 2: addLink');
QuickLinks.links = [];
const result1 = QuickLinks.addLink('GitHub', 'https://github.com');
console.log('  ✓ Add valid link returns true:', result1 === true);
console.log('  ✓ Link added to array:', QuickLinks.links.length === 1);
console.log('  ✓ Link has correct name:', QuickLinks.links[0].name === 'GitHub');
console.log('  ✓ Link has correct URL:', QuickLinks.links[0].url === 'https://github.com');
console.log('  ✓ Link has ID:', typeof QuickLinks.links[0].id === 'string');
console.log('  ✓ Link has createdAt:', typeof QuickLinks.links[0].createdAt === 'number');

// Test 3: addLink validation
console.log('\nTest 3: addLink validation');
QuickLinks.links = [];
const result2 = QuickLinks.addLink('', 'https://example.com');
console.log('  ✓ Reject empty name:', result2 === false && QuickLinks.links.length === 0);

QuickLinks.links = [];
const result3 = QuickLinks.addLink('Test', 'invalid-url');
console.log('  ✓ Reject invalid URL:', result3 === false && QuickLinks.links.length === 0);

QuickLinks.links = [];
QuickLinks.addLink('  Trimmed  ', '  https://test.com  ');
console.log('  ✓ Trim name:', QuickLinks.links[0].name === 'Trimmed');
console.log('  ✓ Trim URL:', QuickLinks.links[0].url === 'https://test.com');

// Test 4: deleteLink
console.log('\nTest 4: deleteLink');
QuickLinks.links = [];
QuickLinks.addLink('Link 1', 'https://example1.com');
QuickLinks.addLink('Link 2', 'https://example2.com');
const idToDelete = QuickLinks.links[0].id;
QuickLinks.deleteLink(idToDelete);
console.log('  ✓ Delete removes link:', QuickLinks.links.length === 1);
console.log('  ✓ Correct link remains:', QuickLinks.links[0].name === 'Link 2');

// Test 5: Unique IDs
console.log('\nTest 5: Unique IDs');
QuickLinks.links = [];
QuickLinks.addLink('Link 1', 'https://example1.com');
QuickLinks.addLink('Link 2', 'https://example2.com');
console.log('  ✓ IDs are unique:', QuickLinks.links[0].id !== QuickLinks.links[1].id);

// Test 6: Storage integration
console.log('\nTest 6: Storage integration');
QuickLinks.links = [];
StorageManager.remove('productivity-dashboard-links');
QuickLinks.addLink('Test', 'https://test.com');
const saved = StorageManager.load('productivity-dashboard-links');
console.log('  ✓ Links saved to storage:', saved !== null && saved.length === 1);
console.log('  ✓ Saved data matches:', saved[0].name === 'Test');

// Test 7: loadLinks
console.log('\nTest 7: loadLinks');
const testLinks = [
    { id: 'link-1', name: 'Test 1', url: 'https://test1.com', createdAt: Date.now() },
    { id: 'link-2', name: 'Test 2', url: 'https://test2.com', createdAt: Date.now() }
];
StorageManager.save('productivity-dashboard-links', testLinks);
QuickLinks.loadLinks();
console.log('  ✓ Load from storage:', QuickLinks.links.length === 2);
console.log('  ✓ Data preserved:', QuickLinks.links[0].name === 'Test 1');

console.log('\n=== All Verification Tests Complete ===');
