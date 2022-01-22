const TaskParser = require('js/TaskParser');

const INPUT_STRING = "TASK_NAME // .PROJECT.PARENT_TASK tomorrow 10:33am";

test('TaskParser should exist', () => {
    expect(TaskParser).not.toBeNull();
});

test('parseTask should return a task', () => {
    var task = TaskParser.parseTask(INPUT_STRING);
    expect(task).not.toBeNull();
    expect(task.name).toBe('TASK_NAME ');
    expect(task.contextSpec).toEqual(['PROJECT', 'PARENT_TASK']);
});

test('Date should be mocked.', () => {
    var now = new Date();
    expect(now.getTime()).toBe(1466424490000);
});

/*
test('testing the mock Date constructor', () => {
    const mockDate = new Date(1466424490000)
    const spy = jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockDate)

    console.log('Mocked:   ', new Date().getTime())
    spy.mockRestore()

    console.log('Restored: ', new Date().getTime())
});
*/

/*
test('parseTask should default to the correct project', () => {
    var task = TaskParser.parseTask("test task");
    expect(task.contextSpec).toEqual('Work');
});
*/

