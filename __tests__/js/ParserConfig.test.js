/**
 * This tests at the feature level, rather than at the ParserConfig unit level.
 */
const TaskParser = require('js/TaskParser');

let USER_CONFIG = {};

// use jest to mock the fs module
jest.mock('fs');
const fs = require('fs');
fs.readFileSync = jest.fn((path) => {
    if (/\.ofq-config.json$/.test(path)) {
        return JSON.stringify(USER_CONFIG);
    }
});


function expectDate(obj, year, month, date) {
    expect(obj.getFullYear()).toBe(year);
    expect(obj.getMonth()).toBe(month);
    expect(obj.getDate()).toBe(date);
}

function expectDateTime(obj, year, month, date, hours, minutes, seconds) {
    expectDate(obj, year, month, date);
    expect(obj.getHours()).toBe(hours);
    expect(obj.getMinutes()).toBe(minutes);
    expect(obj.getSeconds()).toBe(seconds || 0);
}

function expectTask(task, expected) {
    expect(task.name).toBe(expected.name);
    expect(task.tagNames.sort()).toEqual(expected.tagNames.sort());
    expect(task.note).toBe(expected.note);
    expect(task.flagged).toBe(expected.flagged);
    expect(task.contextSpec).toEqual(expected.contextSpec);
    expect(task.completed).toBe(expected.completed);
    expect(task.primaryTagName).toBe(expected.primaryTagName);
}

beforeEach(() => {
    USER_CONFIG = {};
});

test('Should load & execute the default rules', () => {
    USER_CONFIG = {};
    var input = 'task';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.tagNames).not.toContain('user-tag');
});

test('Should load & execute ONLY the user rules', () => {
    USER_CONFIG = {
        rules: [
            {
                name: 'user-config-rule',
                condition: { value: true },
                actions: [{ tag: 'user-tag' }]
            }
        ]
    };
    var input = 'task';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.tagNames).toContain('user-tag');
});


// TODO: load default config
// TODO: load user config
