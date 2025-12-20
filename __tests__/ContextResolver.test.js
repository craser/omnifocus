import ContextResolver from '../src/jxa/lib/ContextResolver.js';


class MockProject {
    name;

    constructor(name) {
        this.name = name;
    }

    name() {
        return this.name;
    }
}

const mockOmniFocus = {
    getActiveProject: jest.fn(),
    createTask: jest.fn(),
    getTask: jest.fn(),
    addTask: jest.fn(),
    getTag: jest.fn(),
    addTags: jest.fn(),
    mock: {
        resetMockOmniFocus: () => {
            mockOmniFocus.getActiveProject.mockReset();
            mockOmniFocus.createTask.mockReset();
            mockOmniFocus.getTask.mockReset();
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

    it('should resolve an empty context to null', () => {
        const spec = [];
        const context = new ContextResolver().resolve(spec);
        expect(context).toBe(null);
    })

    it('should resolve an project name to a project', () => {
        let mockProject = new MockProject('existing');
        mockOmniFocus.getActiveProject.mockReturnValue(mockProject);
        const spec = ['project'];
        const context = new ContextResolver().resolve(spec);
        expect(mockOmniFocus.getActiveProject).toHaveBeenCalledWith('project');
        expect(context).toBe(mockProject);
    })

    it('should resolve nested project names to a project', () => {
        let mockParentProject = new MockProject('parent');
        let mockTask = new MockProject('child');
        mockOmniFocus.getActiveProject.mockReturnValueOnce(mockParentProject);
        mockOmniFocus.getTask.mockReturnValue(mockTask);

        const spec = ['parent', 'child'];
        const context = new ContextResolver().resolve(spec);
        expect(context).toBe(mockTask);
    });

    it('should throw if context cannot be resolved', () => {
        const spec = ['nope'];
        expect(() => new ContextResolver().resolve(spec)).toThrow();
    });

    it('should throw if any part of context cannot be resolved', () => {
        const spec = ['parent', 'child'];
        let mockProject = new MockProject('parent');
        mockOmniFocus.getActiveProject.mockReturnValue(mockProject);
        expect(() => new ContextResolver().resolve(spec)).toThrow();
    });


})