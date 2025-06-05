'use strict'

const TaskParser = require('src/jxa/lib/TaskParser');
const actualTaskParser = new TaskParser();
const expectedTaskParser = (function () {
    let parser = new TaskParser();
    parser.rulesManager = {
        applyRules: (task) => task
    };
    return parser;
}());

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

function expectRulesResult(actualInput, expectedInput) {
    let task = actualTaskParser.parse(actualInput);
    let expected = expectedTaskParser.parse(expectedInput);

    expect(task.name).toBe(expected.name);
    expect(task.tagNames.sort()).toEqual(expected.tagNames.sort());
    expect(task.note).toBe(expected.note);
    expect(task.flagged).toBe(expected.flagged);
    expect(task.contextSpec).toEqual(expected.contextSpec);
    expect(task.completed).toBe(expected.completed);
    expect(task.primaryTagName).toBe(expected.primaryTagName);
    expect(task.dueDate.toString()).toBe(expected.dueDate.toString());
}

test('By default, place tasks in .work.general, due today at 3pm', () => {
    expectRulesResult(
        'task',
        'task // .work.general today 3pm'
    );
});

test('By default, place tasks in .work.general, due on the specified day by 3pm', () => {
    expectRulesResult(
        'task name // :tagname1 tuesday',
        'task name // :tagname1 .work.general tuesday 3pm'
    );
})

test('Tag Expecting tasks as :waiting, due at 10pm', () => {
    expectRulesResult(
        'Expect task name // .proj :tagname1 tuesday',
        'Expect task name // .proj :tagname1 :waiting tuesday 10pm'
    );
})

test('Tag Expecting tasks as :waiting, due at 10pm unless otherwise specified', () => {
    expectRulesResult(
        'Expect task name // :tagname1 tuesday 4pm',
        'Expect task name // .work.general :tagname1 :waiting tuesday 4pm'
    );
})

test('Should auto-set the due date on .work tasks to 3pm', () => {
    expectRulesResult(
        'work task',
        'work task // .work.general today 3pm'
    );
});

test('Should set due date on errands to 11am', () => {
    expectRulesResult(
        "errand // .house :errands",
        "errand // .house :errands today 11am"
    );
});

test('Should set the time on :waiting tasks to 10pm', () => {
    expectRulesResult(
        "waiting task // .proj :home :waiting",
        "waiting task // .proj :home :waiting today 10pm"
    );
});

test('Should set the time on .work tasks to 3pm', () => {
    expectRulesResult(
        'work task // .work',
        'work task // .work.general today 3pm'
    );
});

test('Should set the time on .work tasks to 3pm, even if tagged as :waiting' , () => {
    expectRulesResult(
        'Expect task name // :tagname1 tuesday',
        'Expect task name // .work.general :tagname1 :waiting tuesday 3pm'
    );
})

test('Should NOT set the time on .work tasks if time is specified', () => {
    expectRulesResult(
        'work task // .work 10am',
        'work task // .work.general today 10am'
    );
});

test('Should set the time on .housekeeping tasks to 11am', () => {
    expectRulesResult(
        'work task // .housekeeping',
        'work task // .housekeeping today 11am'
    );
});

test('Should set the time on .house :home tasks to 11am', () => {
    expectRulesResult(
        'work task // .house :home',
        'work task // .house :home today 11am'
    );
});

test('Should NOT set the time on .housekeeping tasks if time is specified', () => {
    expectRulesResult(
        'work task // .housekeeping 5am',
        'work task // .housekeeping today 5am'
    );
});

test('Should NOT set the time on :waiting tasks if time is specified', () => {
    expectRulesResult(
        'package // .proj :waiting 12pm',
        'package // .proj :waiting 12pm'
    );
});


test('If the context is a JIRA ticket, context should be ["work", "Jira Ticket"]', () => {
    expectRulesResult(
        "jira task // .THX-1138",
        "jira task // .work.THX-1138 today 3pm"
    );
});

test('Should auto-detect Jira tickets & put in context.', () => {
    expectRulesResult(
        "LOE for THX-1138",
        "LOE for THX-1138 // .work.THX-1138 today 3pm"
    );
});

test('Should auto-detect Jira tickets & put in context UNLESS context is already specified.', () => {
    expectRulesResult(
        "LOE for THX-1138 // .THX-1138",
        "LOE for THX-1138 // .work.THX-1138 today 3pm"
    );
});

test('Should default context to .work.general', () => {
    expectRulesResult(
        'task',
        'task // .work.general today 3pm'
    );
});

/**
 * This feature is janky AF & I don't like it.
 */
test('Honor :notdue tag, indicating that no due date should be added', () => {
    var input = "task // :notdue";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.dueDate).toBeNull();
    expect(task.tagNames).not.toContain('notdue');
});

/**
 * Items in Movies & Reading are not due by default.
 */
test('Tasks in Movies are not due by default.', () => {
    var input = "Miller's Crossing // .Movies";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.dueDate).toBeNull();
});

test('Tasks in Movies are not due by default, but honor specified due date.', () => {
    var input = "Miller's Crossing // .Movies 7/27/2028";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDateTime(task.dueDate, 2028, 6, 27, 19, 0, 0);
});

test('Tasks in Reading are not due by default.', () => {
    var input = "Miller's Crossing // .Reading";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.dueDate).toBeNull();
});

test('Tasks in Reading are not due by default, but honor specified due date.', () => {
    var input = "Miller's Crossing // .Reading 7/27/2028";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDate(task.dueDate, 2028, 6, 27);
});

test('Tasks with "now" as specified date & time should be due now.', () => {
    var input = "Miller's Crossing // .movies now";
    var parser = new TaskParser();
    var task = parser.parse(input);
    var now = new Date(); // Date is mocked in test setup
    expectDateTime(task.dueDate, now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
});
