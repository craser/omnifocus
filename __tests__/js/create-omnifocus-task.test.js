const parseTask = require('create-omnifocus-task').parseTask;

test('basic existence check', () => {
    expect(parseTask).not.toBeNull();
})
