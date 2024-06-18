'use strict'

const Rule = require('js/Rule');
const TaskParser = require('js/TaskParser');

/**
 * Mock the RuleManager so that the TaskParser just returns raw tasks with
 * no rules applied.
 */
jest.mock('js/RuleManager', () => {
    return function () {
        this.applyRules = function (task) {
            return task;
        }
    }
});

/**
 * Mock the CmdRunner so that the Rule can execute scripts.
 * @param obj
 * @param year
 * @param month
 * @param date
 */
jest.mock('js/CmdRunner', () => {
    return function () {
        this.execSync = function (cmd, args) {
            return `executed: ${cmd} ${args.join(' ')}`;
        }
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

// quick sanity check just to make sure the round-trip works
test('sanity check', () => {
    let rule = new Rule({
        condition: { value: true },
        actions: [{ tag: 'tagged' }]
    });
    let task = new TaskParser().parse('task');
    rule.apply(task);
    expect(task.tagNames).toEqual(['tagged']);
});

/* test all conditions
 *   - value
 *   - or
 *   - and
 *   - not
 *   - name
 *   - project
 *   - tag
 *   - no-project
 *   - no-parent
 */
function expectConditionMatch(string, condition, expectMatch) {
    let MARKER_TAG = 'TEST_ONLY_MARKER_TAG';
    let rule = new Rule({
        condition: condition,
        actions: [{ tag: MARKER_TAG }]
    });
    let task = new TaskParser().parse(string);
    task = rule.apply(task);
    if (expectMatch) {
        expect(task.tagNames).toContain(MARKER_TAG);
    } else {
        expect(task.tagNames).not.toContain(MARKER_TAG);
    }
}

function applyActions(string, actions) {
    let rule = new Rule({
        condition: { value: true },
        actions: actions
    });
    let task = rule.apply(new TaskParser().parse(string));
    return task;
}

test('condition: or', () => {
    let string = 'task';
    [true, false].forEach((a) => {
        [true, false].forEach((b) => {
            expectConditionMatch(string, { or: [{ value: a }, { value: b }] }, a || b);
        });
    });
});

test('condition: and', () => {
    let string = 'task';
    [true, false].forEach((a) => {
        [true, false].forEach((b) => {
            [true, false].forEach((c) => {
                expectConditionMatch(string, { and: [{ value: a }, { value: b }, { value: c }] }, a && b && c);
            });
        });
    });
});

test('condition: not', () => {
    let string = 'task';
    [true, false].forEach((a) => {
        expectConditionMatch(string, { not: { value: a } }, !a);
    });
});

test('condition: name', () => {
    let string = 'task';
    expectConditionMatch(string, { name: 'task' }, true);
    expectConditionMatch(string, { name: 'other' }, false);
});

test('condition: project', () => {
    let string = 'task // .project';
    expectConditionMatch(string, { project: 'project' }, true);
    expectConditionMatch(string, { project: 'other' }, false);
});

test('condition: tag', () => {
    let string = 'task // :before :tag :after';
    expectConditionMatch(string, { tag: 'tag' }, true);
    expectConditionMatch(string, { tag: 'other' }, false);
});

test('condition: no-project', () => {
    expectConditionMatch('task', { 'no-project': true }, true);
    expectConditionMatch('task', { 'no-project': false }, false);
    expectConditionMatch('task // .project', { 'no-project': true }, false);
    expectConditionMatch('task // .project', { 'no-project': false }, true);
});

test('condition: no-parent', () => {
    expectConditionMatch('task // .project', { 'no-parent': true }, true);
    expectConditionMatch('task // .project', { 'no-parent': false }, false);
    expectConditionMatch('task // .project.parent', { 'no-parent': true }, false);
    expectConditionMatch('task // .project.parent', { 'no-parent': false }, true);
});


/* test all actions
 *   - tag
 *   - project
 *   - parent
 *   - due
 *   - removeTag
 */
test('action: tag', () => {
    let task = applyActions('task', [{ tag: 'test-tag' }]);
    expectTask(task, {
        name: 'task',
        tagNames: ['test-tag'],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: 'test-tag'
    });
});

test('action: project', () => {
    let task = applyActions('task', [{ project: 'test-project' }]);
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: ['test-project'],
        completed: false,
        primaryTagName: null
    });
});

test('action: project & parent', () => {
    let task = applyActions('task // .test-parent', [{ project: 'test-project' }]);
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: ['test-project', 'test-parent'],
        completed: false,
        primaryTagName: null
    });
});

test('action: parent', () => {
    let task = applyActions('task', [{ parent: 'test-parent' }]);
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: ['test-parent'],
        completed: false,
        primaryTagName: null
    });
});

test('action: parent & project', () => {
    let task = applyActions('task // .test-project', [{ parent: 'test-parent' }]);
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: ['test-project', 'test-parent'],
        completed: false,
        primaryTagName: null
    });
});

test('action: due', () => {
    let task = applyActions('task', [{ due: 'today' }]);
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: null,
    });
    expectDate(task.dueDate, 2021, 0, 1);
});

test('action: due', () => {
    let task = applyActions('task', [{ due: 'today' }]);
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: null,
    });
    expectDate(task.dueDate, 2021, 0, 1);
});

test('action: parent & concatenate', () => {
    let task = applyActions('ABCD-1234', [
        {
            parent: {
                concatenate: [
                    { "match": { "name": "/\\b\\w\\w\\w\\w?-\\d\\d\\d\\d?\\b/" } },
                    ': ',
                    {
                        script: {
                            command: 'echo',
                            args: [
                                '-n',
                                { "match": { "name": "/\\b\\w\\w\\w\\w?-\\d\\d\\d\\d?\\b/" } }
                            ]
                        }
                    }
                ]
            }
        }
    ]);
    expectTask(task, {
        name: 'ABCD-1234',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: ['ABCD-1234: executed: echo -n ABCD-1234'],
        completed: false,
        primaryTagName: null
    });
})

test('action: keep specified due date', () => {
    let task = applyActions('task // 7/22/2024', [{ due: 'today' }]);
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: null,
    });
    expectDate(task.dueDate, 2024, 6, 22);
});

test('action: nullify due date', () => {
    // make the task due today, then nullify that
    let task = applyActions('task', [{ due: 'today' }, { due: null }]);
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: null,
    });
    expect(task.dueDate).toBe(null);
});

test('action: should NOT nullify due date if "now" is specified', () => {
    let task = applyActions('task // now', [{ due: null }]);
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: null,
    });
    var now = new Date(); // Date is mocked in test setup
    expectDateTime(task.dueDate, now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
});

test('action: date modifier should NOT modify due date if "now" is specified', () => {
    // due specifier includes a date, a date modifier, and a time specifier,
    let task = applyActions('task // now', [{ due: '10/10/2030 5days 9pm' }]);
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: null,
    });
    var now = new Date(); // Date is mocked in test setup
    expectDateTime(task.dueDate, now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
});

test('action: remove-tag', () => {
    let task = applyActions('task // :test-tag', [{ 'remove-tag': 'test-tag' }]);
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: null
    });
});





