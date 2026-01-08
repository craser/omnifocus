import TaskCreator from '../../src/jxa/lib/TaskCreator.js';
import OmniFocus from '../../src/jxa/lib/OmniFocus.js';

const MockOmniFocus = {
    getActiveProject: jest.fn(),
    createTask: jest.fn(),
    addTask: jest.fn(),
    getTag: jest.fn(),
    addTags: jest.fn(),
    mock: {
        resetMockOmniFocus: () => {
            MockOmniFocus.getActiveProject.mockReset();
            MockOmniFocus.createTask.mockReset();
            MockOmniFocus.addTask.mockReset();
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
        const mockProject = { name: () => 'existing (empty context test)'};
        MockOmniFocus.getActiveProject.mockReturnValue(mockProject);
        const creator = new TaskCreator();
        const result = creator.createTask(task);
        const { ofTask } = result;
        expect(MockOmniFocus.addTask).toHaveBeenCalledTimes(1);
        expect(MockOmniFocus.addTask).toHaveBeenCalledWith(null, ofTask);
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
        const result = creator.createTask(task);
        expect(result.success).toBe(false);
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
        let mockProject = { name: () => 'existing'};
        MockOmniFocus.getActiveProject.mockReturnValue(mockProject);
        MockOmniFocus.createTask.mockReturnValue('RETURNED CREATED TASK');
        const creator = new TaskCreator();
        const result = creator.createTask(task);
        const { ofTask } = result;
        expect(ofTask).toBe('RETURNED CREATED TASK');
        expect(MockOmniFocus.addTask).toHaveBeenCalledWith(mockProject, ofTask);
    })
})
