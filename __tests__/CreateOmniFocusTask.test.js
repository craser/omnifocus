const CreateOmniFocusTask = require('src/jxa/create-omnifocus-task');

jest.mock('child_process');

test('CreateOmniFocusTask should exist', () => {
    expect(CreateOmniFocusTask).toBeTruthy();
});

