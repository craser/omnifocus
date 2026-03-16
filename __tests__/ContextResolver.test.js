import ContextResolver from '../src/jxa/lib/ContextResolver.js';
import Context from '../src/jxa/lib/Context.js';


class MockProject {
    n;

    constructor(name) {
        this.n = name;
    }

    name() {
        return this.n;
    }
}

const mockOmniFocus = {
    getFolder: jest.fn(),
    getProjectInFolder: jest.fn(),
    getActiveProject: jest.fn(),
    createTask: jest.fn(),
    getChild: jest.fn(),
    addTask: jest.fn(),
    getTag: jest.fn(),
    addTags: jest.fn(),
    mock: {
        resetMockOmniFocus: () => {
            mockOmniFocus.getFolder.mockReset();
            mockOmniFocus.getProjectInFolder.mockReset();
            mockOmniFocus.getActiveProject.mockReset();
            mockOmniFocus.createTask.mockReset();
            mockOmniFocus.getChild.mockReset();
            mockOmniFocus.addTask.mockReset();
            mockOmniFocus.getTag.mockReset();
            mockOmniFocus.addTags.mockReset();
        }
    }
};


jest.mock('../src/jxa/lib/OmniFocus', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => {
            return mockOmniFocus;
        })
    }
});


describe('ContextResolver', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockOmniFocus.mock.resetMockOmniFocus();
    });

    it('should resolve an empty context to inbox', () => {
        const spec = [];
        const context = new ContextResolver().resolve(spec);
        expect(context.type).toBe(Context.TYPE_INBOX);
    })

    it('should resolve a folder name to a folder', () => {
        let folder = new MockProject('folder');
        let project = new MockProject('project');
        mockOmniFocus.getFolder.mockImplementation((parent, name) => {
            return (name === 'folder') ? folder : null;
        });
        mockOmniFocus.getProjectInFolder.mockImplementation((parent, name) => {
            return (name === 'project') ? project : null;
        })
        const spec = ['folder', 'project'];
        const context = new ContextResolver().resolve(spec);
        expect(mockOmniFocus.getFolder).toHaveBeenCalledWith(null, 'folder');
        expect(mockOmniFocus.getProjectInFolder).toHaveBeenCalledWith(folder, 'project');
        expect(mockOmniFocus.getActiveProject).not.toHaveBeenCalled(); // paranoid
        expect(context.type).toBe(Context.TYPE_PROJECT);
        expect(context.ofContextObject).toBe(project);

    });

    it('should resolve nested folders', () => {
        let parentFolder = new MockProject('parent folder');
        let childFolder = new MockProject('child folder');
        let project = new MockProject('project');
        mockOmniFocus.getFolder.mockImplementation((parent, name) => {
            switch (name) {
                case 'parent folder':
                    return parentFolder;
                case 'child folder':
                    return childFolder;
                default:
                    return null;
            }
        });
        mockOmniFocus.getProjectInFolder.mockImplementation((parent, name) => {
            return (parent === childFolder && name === 'project')
                ? project
                : null;

        });

        const context = new ContextResolver().resolve(['parent folder', 'child folder', 'project']);
        expect(mockOmniFocus.getFolder).toHaveBeenCalledWith(null, 'parent folder');
        expect(mockOmniFocus.getFolder).toHaveBeenCalledWith(parentFolder, 'child folder');
        expect(mockOmniFocus.getProjectInFolder).toHaveBeenCalledWith(childFolder, 'project');
        expect(mockOmniFocus.getActiveProject).not.toHaveBeenCalled()
        expect(context.type).toBe(Context.TYPE_PROJECT);
        expect(context.ofContextObject).toBe(project);
    });

    it('should resolve an project name to a project', () => {
        let mockProject = new MockProject('existing');
        mockOmniFocus.getActiveProject.mockReturnValue(mockProject);
        const spec = ['project'];
        const context = new ContextResolver().resolve(spec);
        expect(mockOmniFocus.getActiveProject).toHaveBeenCalledWith('project');
        expect(context.type).toBe(Context.TYPE_PROJECT);
        expect(context.ofContextObject).toBe(mockProject);
    })

    it('should resolve nested project names to a project', () => {
        let mockParentProject = new MockProject('parent');
        let mockTask = new MockProject('child');
        mockOmniFocus.getActiveProject.mockReturnValueOnce(mockParentProject);
        mockOmniFocus.getChild.mockReturnValue(mockTask);

        const spec = ['parent', 'child'];
        const context = new ContextResolver().resolve(spec);
        expect(context.type).toBe(Context.TYPE_PROJECT);
        expect(context.ofContextObject).toBe(mockTask);
    });

    it('should throw if context cannot be resolved', () => {
        const spec = ['nope'];
        expect(() => new ContextResolver().resolve(spec)).toThrow();
    });

    it('should resolve to inbox if any part of context cannot be resolved', () => {
        const spec = ['parent', 'child'];
        let mockProject = new MockProject('parent');
        mockOmniFocus.getActiveProject.mockReturnValue(mockProject);
        const context = new ContextResolver().resolve(spec);
        expect(context.type).toBe(Context.TYPE_INBOX);
    });


})
