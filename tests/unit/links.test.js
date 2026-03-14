/**
 * Unit Tests for QuickLinks Module
 * Tests link management functionality
 */

describe('QuickLinks Module', () => {
    let mockLinksContainer;
    let mockNameInput;
    let mockUrlInput;
    let mockAddBtn;

    beforeEach(() => {
        // Reset QuickLinks state
        QuickLinks.links = [];
        
        // Create mock DOM elements
        mockLinksContainer = document.createElement('div');
        mockLinksContainer.id = 'links-container';
        document.body.appendChild(mockLinksContainer);
        
        mockNameInput = document.createElement('input');
        mockNameInput.id = 'link-name-input';
        document.body.appendChild(mockNameInput);
        
        mockUrlInput = document.createElement('input');
        mockUrlInput.id = 'link-url-input';
        document.body.appendChild(mockUrlInput);
        
        mockAddBtn = document.createElement('button');
        mockAddBtn.id = 'link-add-btn';
        document.body.appendChild(mockAddBtn);
        
        // Clear storage
        StorageManager.remove('productivity-dashboard-links');
    });

    afterEach(() => {
        // Clean up DOM
        document.body.removeChild(mockLinksContainer);
        document.body.removeChild(mockNameInput);
        document.body.removeChild(mockUrlInput);
        document.body.removeChild(mockAddBtn);
    });

    describe('validateUrl', () => {
        test('should accept valid http URL', () => {
            expect(QuickLinks.validateUrl('http://example.com')).toBe(true);
        });

        test('should accept valid https URL', () => {
            expect(QuickLinks.validateUrl('https://example.com')).toBe(true);
        });

        test('should reject URL without protocol', () => {
            expect(QuickLinks.validateUrl('example.com')).toBe(false);
        });

        test('should reject empty URL', () => {
            expect(QuickLinks.validateUrl('')).toBe(false);
        });

        test('should reject whitespace-only URL', () => {
            expect(QuickLinks.validateUrl('   ')).toBe(false);
        });

        test('should reject non-string URL', () => {
            expect(QuickLinks.validateUrl(null)).toBe(false);
            expect(QuickLinks.validateUrl(undefined)).toBe(false);
            expect(QuickLinks.validateUrl(123)).toBe(false);
        });
    });

    describe('addLink', () => {
        test('should add valid link and return true', () => {
            const result = QuickLinks.addLink('GitHub', 'https://github.com');
            expect(result).toBe(true);
            expect(QuickLinks.links.length).toBe(1);
            expect(QuickLinks.links[0].name).toBe('GitHub');
            expect(QuickLinks.links[0].url).toBe('https://github.com');
        });

        test('should generate unique ID for each link', () => {
            QuickLinks.addLink('Link 1', 'https://example1.com');
            QuickLinks.addLink('Link 2', 'https://example2.com');
            expect(QuickLinks.links[0].id).not.toBe(QuickLinks.links[1].id);
        });

        test('should set createdAt timestamp', () => {
            const before = Date.now();
            QuickLinks.addLink('Test', 'https://test.com');
            const after = Date.now();
            expect(QuickLinks.links[0].createdAt).toBeGreaterThanOrEqual(before);
            expect(QuickLinks.links[0].createdAt).toBeLessThanOrEqual(after);
        });

        test('should reject empty name', () => {
            const result = QuickLinks.addLink('', 'https://example.com');
            expect(result).toBe(false);
            expect(QuickLinks.links.length).toBe(0);
        });

        test('should reject whitespace-only name', () => {
            const result = QuickLinks.addLink('   ', 'https://example.com');
            expect(result).toBe(false);
            expect(QuickLinks.links.length).toBe(0);
        });

        test('should reject invalid URL', () => {
            const result = QuickLinks.addLink('Test', 'invalid-url');
            expect(result).toBe(false);
            expect(QuickLinks.links.length).toBe(0);
        });

        test('should trim name and URL', () => {
            QuickLinks.addLink('  GitHub  ', '  https://github.com  ');
            expect(QuickLinks.links[0].name).toBe('GitHub');
            expect(QuickLinks.links[0].url).toBe('https://github.com');
        });

        test('should call saveLinks after adding', () => {
            QuickLinks.addLink('Test', 'https://test.com');
            const saved = StorageManager.load('productivity-dashboard-links');
            expect(saved).toEqual(QuickLinks.links);
        });
    });

    describe('deleteLink', () => {
        test('should delete link by id', () => {
            QuickLinks.addLink('Link 1', 'https://example1.com');
            QuickLinks.addLink('Link 2', 'https://example2.com');
            const idToDelete = QuickLinks.links[0].id;
            
            QuickLinks.deleteLink(idToDelete);
            
            expect(QuickLinks.links.length).toBe(1);
            expect(QuickLinks.links[0].name).toBe('Link 2');
        });

        test('should handle non-existent id gracefully', () => {
            QuickLinks.addLink('Test', 'https://test.com');
            QuickLinks.deleteLink('non-existent-id');
            expect(QuickLinks.links.length).toBe(1);
        });

        test('should call saveLinks after deleting', () => {
            QuickLinks.addLink('Test', 'https://test.com');
            const id = QuickLinks.links[0].id;
            QuickLinks.deleteLink(id);
            const saved = StorageManager.load('productivity-dashboard-links');
            expect(saved).toEqual(QuickLinks.links);
        });
    });

    describe('loadLinks', () => {
        test('should load links from storage', () => {
            const testLinks = [
                { id: 'link-1', name: 'Test 1', url: 'https://test1.com', createdAt: Date.now() },
                { id: 'link-2', name: 'Test 2', url: 'https://test2.com', createdAt: Date.now() }
            ];
            StorageManager.save('productivity-dashboard-links', testLinks);
            
            QuickLinks.loadLinks();
            
            expect(QuickLinks.links).toEqual(testLinks);
        });

        test('should initialize empty array when no storage data', () => {
            QuickLinks.loadLinks();
            expect(QuickLinks.links).toEqual([]);
        });

        test('should initialize empty array when storage data is invalid', () => {
            StorageManager.save('productivity-dashboard-links', 'invalid-data');
            QuickLinks.loadLinks();
            expect(QuickLinks.links).toEqual([]);
        });
    });

    describe('saveLinks', () => {
        test('should save links to storage', () => {
            QuickLinks.links = [
                { id: 'link-1', name: 'Test', url: 'https://test.com', createdAt: Date.now() }
            ];
            
            QuickLinks.saveLinks();
            
            const saved = StorageManager.load('productivity-dashboard-links');
            expect(saved).toEqual(QuickLinks.links);
        });
    });

    describe('renderLinks', () => {
        test('should render links to DOM', () => {
            QuickLinks.links = [
                { id: 'link-1', name: 'GitHub', url: 'https://github.com', createdAt: Date.now() },
                { id: 'link-2', name: 'Google', url: 'https://google.com', createdAt: Date.now() }
            ];
            
            QuickLinks.renderLinks();
            
            const linkItems = mockLinksContainer.querySelectorAll('.link-item');
            expect(linkItems.length).toBe(2);
        });

        test('should render link with correct name', () => {
            QuickLinks.links = [
                { id: 'link-1', name: 'GitHub', url: 'https://github.com', createdAt: Date.now() }
            ];
            
            QuickLinks.renderLinks();
            
            const linkBtn = mockLinksContainer.querySelector('.link-btn');
            expect(linkBtn.textContent).toBe('GitHub');
        });

        test('should render link with correct URL', () => {
            QuickLinks.links = [
                { id: 'link-1', name: 'GitHub', url: 'https://github.com', createdAt: Date.now() }
            ];
            
            QuickLinks.renderLinks();
            
            const linkBtn = mockLinksContainer.querySelector('.link-btn');
            expect(linkBtn.href).toBe('https://github.com/');
        });

        test('should open link in new tab', () => {
            QuickLinks.links = [
                { id: 'link-1', name: 'GitHub', url: 'https://github.com', createdAt: Date.now() }
            ];
            
            QuickLinks.renderLinks();
            
            const linkBtn = mockLinksContainer.querySelector('.link-btn');
            expect(linkBtn.target).toBe('_blank');
        });

        test('should include security attributes', () => {
            QuickLinks.links = [
                { id: 'link-1', name: 'GitHub', url: 'https://github.com', createdAt: Date.now() }
            ];
            
            QuickLinks.renderLinks();
            
            const linkBtn = mockLinksContainer.querySelector('.link-btn');
            expect(linkBtn.rel).toBe('noopener noreferrer');
        });

        test('should render delete button for each link', () => {
            QuickLinks.links = [
                { id: 'link-1', name: 'GitHub', url: 'https://github.com', createdAt: Date.now() }
            ];
            
            QuickLinks.renderLinks();
            
            const deleteBtn = mockLinksContainer.querySelector('.link-delete-btn');
            expect(deleteBtn).toBeTruthy();
            expect(deleteBtn.textContent).toBe('Delete');
        });

        test('should clear existing links before rendering', () => {
            QuickLinks.links = [
                { id: 'link-1', name: 'Test', url: 'https://test.com', createdAt: Date.now() }
            ];
            QuickLinks.renderLinks();
            
            QuickLinks.links = [];
            QuickLinks.renderLinks();
            
            const linkItems = mockLinksContainer.querySelectorAll('.link-item');
            expect(linkItems.length).toBe(0);
        });
    });

    describe('init', () => {
        test('should load links on initialization', () => {
            const testLinks = [
                { id: 'link-1', name: 'Test', url: 'https://test.com', createdAt: Date.now() }
            ];
            StorageManager.save('productivity-dashboard-links', testLinks);
            
            QuickLinks.init();
            
            expect(QuickLinks.links).toEqual(testLinks);
        });

        test('should render links on initialization', () => {
            QuickLinks.links = [
                { id: 'link-1', name: 'Test', url: 'https://test.com', createdAt: Date.now() }
            ];
            
            QuickLinks.init();
            
            const linkItems = mockLinksContainer.querySelectorAll('.link-item');
            expect(linkItems.length).toBe(1);
        });
    });
});
