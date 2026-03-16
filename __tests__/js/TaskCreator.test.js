import TaskCreator from '../../src/jxa/lib/TaskCreator.js';
import OmniFocus from '../../src/jxa/lib/OmniFocus.js';

const MockOmniFocus = {
    getFolder: jest.fn(),
    getProjectInFolder: jest.fn(),
    getActiveProject: jest.fn(),
    createTask: jest.fn(),
    addTaskToFolder: jest.fn(),
    addTaskToProject: jest.fn(),
    addTaskToInbox: jest.fn(),
    addTask: jest.fn(),
    getTag: jest.fn(),
    addTags: jest.fn(),
    mock: {
        resetMockOmniFocus: () => {
            MockOmniFocus.getFolder.mockReset();
            MockOmniFocus.getProjectInFolder.mockReset();
            MockOmniFocus.getActiveProject.mockReset();
            MockOmniFocus.createTask.mockReset();
            MockOmniFocus.addTask.mockReset();
            MockOmniFocus.addTaskToFolder.mockReset();
            MockOmniFocus.addTaskToProject.mockReset();
            MockOmniFocus.addTaskToInbox.mockReset();
            MockOmniFocus.getTag.mockReset();
            MockOmniFocus.addTags.mockReset();
        }
    }
};


jest.mock('../../src/jxa/lib/OmniFocus.js', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => {
            return MockOmniFocus;
        })
    }
});

describe('TaskCreator', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        MockOmniFocus.mock.resetMockOmniFocus();
    });

    it('empty context → should create a task in the inbox', () => {
        const task = {
            name: 'DUMMY TASK NAME',
            note: 'DUMMY TASK NOTE',
            primaryTagName: null,
            tagNames: [],
            completed: false,
            flagged: false,
            dueDate: null,
            contextSpec: []
        };
        MockOmniFocus.createTask.mockReturnValue('RETURNED CREATED TASK');
        MockOmniFocus.addTask.mockReturnValue('RETURNED ADDED TASK')
        const mockProject = { name: () => 'existing (empty context test)' };
        MockOmniFocus.getActiveProject.mockReturnValue(mockProject);
        const creator = new TaskCreator();
        const ofTask = creator.createTask(task);
        expect(MockOmniFocus.addTaskToInbox).toHaveBeenCalledTimes(1);
        expect(MockOmniFocus.addTaskToInbox).toHaveBeenCalledWith(ofTask);

    });

    it('invalid context → throw', () => {
        const task = {
            name: 'DUMMY TASK NAME',
            note: 'DUMMY TASK NOTE',
            primaryTagName: null,
            tagNames: [],
            completed: false,
            flagged: false,
            dueDate: null,
            contextSpec: ['nope'] // does not exist
        };
        const creator = new TaskCreator();
        expect(() => creator.createTask(task)).toThrow();
    });

    it('valid context → create task under context', () => {
        const task = {
            name: 'DUMMY TASK NAME',
            note: 'DUMMY TASK NOTE',
            primaryTagName: null,
            tagNames: [],
            completed: false,
            flagged: false,
            dueDate: null,
            contextSpec: ['existing'] // does not exist
        };
        let mockProject = { name: () => 'existing' };
        MockOmniFocus.getActiveProject.mockReturnValue(mockProject);
        MockOmniFocus.createTask.mockReturnValue('RETURNED CREATED TASK');
        const creator = new TaskCreator();
        const ofTask = creator.createTask(task);
        expect(ofTask).toBe('RETURNED CREATED TASK');
        expect(MockOmniFocus.addTaskToProject).toHaveBeenCalledWith(mockProject, ofTask);
    })

    it('folder context → create task in folder', () => {
        const task = {
            name: 'DUMMY TASK NAME',
            note: 'DUMMY TASK NOTE',
            primaryTagName: null,
            tagNames: [],
            completed: false,
            flagged: false,
            dueDate: null,
            contextSpec: ['folder']
        };
        let mockFolder = { name: () => 'folder' };
        MockOmniFocus.getFolder.mockImplementation((parent, name) => {
            return (name === 'folder')
                ? mockFolder
                : null;
        });
        MockOmniFocus.createTask.mockReturnValue('RETURNED CREATED TASK');
        const creator = new TaskCreator();
        const ofTask = creator.createTask(task);
        expect(ofTask).toBe('RETURNED CREATED TASK');
        expect(MockOmniFocus.addTaskToFolder).toHaveBeenCalledWith(mockFolder, ofTask);
    });
})
