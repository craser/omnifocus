const CreateOmniFocusTask = require('create-omnifocus-task');

jest.mock('child_process');

test('CreateOmniFocusTask should exist', () => {
    expect(CreateOmniFocusTask).toBeTruthy();
});

test('Should correctly call shell script to create task.', () => {
    let child_process = require('child_process');
    child_process.spawn.mockImplementation(() => {
        return {
            on: () => {},
            stdout: {
                on: () => {}
            },
            stderr: {
                on: () => {}
            }
        }
    });

    let task = { message: "I want to be an Air Force Ranger!" };
    let creator = new CreateOmniFocusTask();
    creator.createTask(task);

    expect(child_process.spawn.mock.calls.length).toBe(1);
    expect(child_process.spawn.mock.calls[0][0]).toContain('json-to-task.js');
    expect(child_process.spawn.mock.calls[0][1]).toEqual([JSON.stringify(task)]);
});
