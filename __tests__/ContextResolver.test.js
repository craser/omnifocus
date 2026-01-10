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
    getChild: jest.fn(),
    addTask: jest.fn(),
    getTag: jest.fn(),
    addTags: jest.fn(),
    mock: {
        resetMockOmniFocus: () => {
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

    describe('resolve', () => {

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
            mockOmniFocus.getChild.mockReturnValue(mockTask);

            const spec = ['parent', 'child'];
            const context = new ContextResolver().resolve(spec);
            expect(context).toBe(mockTask);
        });

        it('should throw if context cannot be resolved', () => {
            const spec = ['nope'];
            mockOmniFocus.getActiveProject.mockImplementationOnce(() => { throw new Error() });
            expect(() => new ContextResolver().resolve(spec)).toThrow();
        });

        it('should throw if any part of context cannot be resolved', () => {
            const spec = ['parent', 'child'];
            let mockProject = new MockProject('parent');
            mockOmniFocus.getActiveProject.mockReturnValue(mockProject);
            mockOmniFocus.getChild.mockImplementationOnce(() => { throw new Error() });
            expect(() => new ContextResolver().resolve(spec)).toThrow();
        });

    });

    describe('getCanonicalSpec', () => {
        it('should resolve an empty context to an empty array', () => {
            const context = new ContextResolver().getCanonicalSpec([]);
            expect(context).toEqual([]);
        });

        it('should resolve a null context to an empty array', () => {
            const context = new ContextResolver().getCanonicalSpec(null);
            expect(context).toEqual([]);
        });

        it('should resolve shortened names to full Project/Task names', () => {
            let mockParentProject = new MockProject('Expanded Project Name');
            let mockTask = new MockProject('Expanded Task Name');
            mockOmniFocus.getActiveProject.mockReturnValueOnce(mockParentProject);
            mockOmniFocus.getChild.mockReturnValue(mockTask);

            const spec = ['parent', 'child']; // this doesn't matter - return values mocked
            const context = new ContextResolver().getCanonicalSpec(spec);
            expect(context).toEqual(['Expanded Project Name', 'Expanded Task Name']);
        });

        it('should throw if any part of context cannot be resolved', () => {
            const spec = ['parent', 'child'];
            let mockProject = new MockProject('parent');
            mockOmniFocus.getActiveProject.mockReturnValue(mockProject);
            expect(() => new ContextResolver().getCanonicalSpec(spec)).toThrow();
        });

    });
})
