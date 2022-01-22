const TaskParser = require('js/TaskParser');

function checkExpectedDay(specifiers, expectedDayIndex) {
    specifiers.forEach((input) => {
        var date = TaskParser.parseDate(input);
        expect(date.getDay()).toBe(expectedDayIndex);
        expect(date.getTime()).toBeGreaterThanOrEqual(new Date().getTime()); // calls mocked Date.
    })
}
function checkExpectedDate(specifier, expectedYear, expectedMonth, expectedDate) {
    var date = TaskParser.parseDate(specifier);
    expect(date.getFullYear()).toBe(expectedYear);
    expect(date.getMonth()).toBe(expectedMonth);
    expect(date.getDate()).toBe(expectedDate);
}

test('parseTask should correctly interpret "tomorrow" as due date', () => {
    // new Date() always returns 1/1/2021 at 12:00 AM, PST
    var task = TaskParser.parseTask('test // tomorrow'); // Should be 1/2/2021
    expect(task.dueDate.getFullYear()).toBe(2021);
    expect(task.dueDate.getMonth()).toBe(0);
    expect(task.dueDate.getDay()).toBe(6);
});

test('Due date should default to 7pm', () => {
    // new Date() always returns 1/1/2021 at 12:00 AM, PST
    var task = TaskParser.parseTask('test'); // Should be 1/2/2021
    expect(task.dueDate.getHours()).toBe(19);
    expect(task.dueDate.getMinutes()).toBe(0);
});

test('Honor ex. 10pm as time spec', () => {
    function check(inputs, expectedHours) {
        inputs.forEach((input) => {
            var task = TaskParser.parseTask(input);
            expect(task.dueDate.getHours()).toBe(expectedHours);
        });
    }
    check(['a // 9am', 'a // 9:00am'], 9);
    check(['p // 10pm', 't // 10:00pm'], 22); // PM
});

/**
 * (mon|monday), non-case-sensitive
 */
test('Honor specifiers for Monday', () => {
    var specifiers = ['mon', 'Mon', 'monday', 'Monday'];
    checkExpectedDay(specifiers, 1);
});

/**
 * (tues|tuesday), non-case-sensitive
 */
test('Honor specifiers for Tuesday', () => {
    var specifiers = ['tues', 'Tues', 'Tuesday', 'tuesday',];
    checkExpectedDay(specifiers, 2);
});

/**
 * (wed|wednesday), non-case-sensitive
 */
test('Honor specifiers for Wednesday', () => {
    var specifiers = ['wed', 'Wed', 'wednesday', 'Wednesday'];
    checkExpectedDay(specifiers, 3);
});

/**
 * (thr|thrs|thurs|thursday), non-case-sensitive
 */
test('Honor specifiers for Thursday', () => {
    var specifiers = ['thr', 'thrs', 'thurs', 'thursday', 'Thr', 'Thrs', 'Thurs', 'Thursday'];
    checkExpectedDay(specifiers, 4);
});

/**
 * (fri|friday), non-case-sensitive
 */
test('Honor specifiers for Friday', () => {
    var specifiers = ['fri', 'friday', 'Fri', 'Friday'];
    checkExpectedDay(specifiers, 5);
});

/**
 * (sat|saturday), non-case-sensitive
 */
test('Honor specifiers for Saturday', () => {
    var specifiers = ['sat', 'saturday', 'Sat', 'Saturday'];
    checkExpectedDay(specifiers, 6);
});

/**
 * (sun|sunday), non-case-sensitive
 */
test('Honor specifiers for Sunday', () => {
    var specifiers = ['sun', 'sunday', 'Sun', 'Sunday'];
    checkExpectedDay(specifiers, 0);
});

/**
 * Should support relative time in days. Ex: "10days"
 * (Also supports the typo "7day")
 */
test('Honor relative time in days', () => {
    checkExpectedDate('', 2021, 0, 1); // checking default date
    checkExpectedDate('10days', 2021,0, 11);
    checkExpectedDate('10day', 2021, 0, 11); // check the typo
    checkExpectedDate('35days', 2021, 1, 5);
    checkExpectedDate('90days', 2021, 3, 1);
});

test('Honor m/d/y date specifiers', () => {
    // Without a year, should parse to a date in the future.
    checkExpectedDate('5/15', 2021, 4, 15);
    checkExpectedDate('05/15', 2021, 4, 15);
    // CAN specify a date in the past.
    checkExpectedDate('5/15/2002', 2002, 4, 15);
});
