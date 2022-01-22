const TaskParser = require('js/TaskParser');

function checkExpectedDay(specifiers, expectedDayIndex) {
    specifiers.forEach((input) => {
        var date = TaskParser.parseDate(input);
        expect(date.getDay()).toBe(expectedDayIndex);
        expect(date.getTime()).toBeGreaterThanOrEqual(new Date().getTime()); // calls mocked Date.
    })
}

test('TaskParser should exist', () => {
    expect(TaskParser).not.toBeNull();
});

test('parseTask should trim the name', () => {
    var inputs = [
        "task_name",
        "task_name //",
        "task_name // tomorrow",
        "task_name // .house :home",
        "task_name// .work.THX_1138 tomorrow 10:30am :errands"
    ];
    inputs.forEach((input) => {
        var task = TaskParser.parseTask(input);
        expect(task.name).toBe('task_name');
    });
});

test('parseTask should find the right tag names', () => {
    var inputs = [
        'test // :first :second :third',
        'test // :first :second :third tomorrow',
        'test // :first :second :third monday 10:34pm',
        'test // :first :second :third .work.static',
        'test:bonkers // :first :second :third .work.static',
        'test // :first :second :third monday 10:34pm /** note goes here',
        'test // :first :second :third .work.static /** note goes here'
    ];
    inputs.forEach((input) => {
        var task = TaskParser.parseTask(input);
        expect(task.primaryTagName).toBe('first');
        expect(task.tagNames).toEqual(['first', 'second', 'third']);
    });
});

test('parseTask should find the right note', () => {
    var inputs = [
        'test // /** note goes here',
        'test // :first :second :third tomorrow /** note goes here',
        'test // :first :second :third monday 10:34pm /** note goes here',
        'test // :first :second :third .work.static /** note goes here',
        'test:bonkers // :first :second :third .work.static/** note goes here',
    ];
    inputs.forEach((input) => {
        var task = TaskParser.parseTask(input);
        expect(task.note).toBe('note goes here');
    });
});


