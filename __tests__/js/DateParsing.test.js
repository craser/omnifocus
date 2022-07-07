const DateParser = require('js/DateParser');

function checkExpectedDay(specifiers, expectedDayIndex) {
    specifiers.forEach((input) => {
        var date = new DateParser().parseDate(input);
        expect(date.getDay()).toBe(expectedDayIndex);
        expect(date.getTime()).toBeGreaterThanOrEqual(new Date().getTime()); // calls mocked Date.
    })
}

function checkExpectedDate(specifier, expectedYear, expectedMonth, expectedDate) {
    var date = new DateParser().parseDate(specifier);
    expect(date.getFullYear()).toBe(expectedYear);
    expect(date.getMonth()).toBe(expectedMonth);
    expect(date.getDate()).toBe(expectedDate);
}

function checkExpectedTime(specifier, expectedHours, expectedMinutes) {
    var time = new DateParser().parseTime(specifier);
    expect(time.hours).toBe(expectedHours);
    expect(time.minutes).toBe(expectedMinutes);
}

test('parseTask should correctly interpret "now" as due date', () => {
    var now = new Date();
    checkExpectedTime('now', now.getHours(), now.getMinutes());
});

test('parseTask should correctly interpret "tomorrow" as due date', () => {
    // new Date() always returns 1/1/2021 at 12:00 AM, PST
    checkExpectedDate('', 2021, 0, 1); // check premises
    checkExpectedDate('tomorrow', 2021, 0, 2);
});

test('Honor ex. 10pm as time spec', () => {
    checkExpectedTime('9am', 9, 0);
    checkExpectedTime('9:00am', 9, 0);
    checkExpectedTime('10pm', 22, 0); // PM
    checkExpectedTime('10:00pm', 22, 0); // PM
});

test('Honor relative time in hrs', () => {
    checkExpectedDate('', 2021, 0, 1); // check assumptions
    checkExpectedTime('9hrs', 9, 0); // basic
    checkExpectedTime('15hrs', 15, 0); // cross to PM
    checkExpectedTime('30hrs', 6, 0); // cross to next day
});

test('Honor relative time in min', () => {
    checkExpectedDate('', 2021, 0, 1); // check assumptions
    checkExpectedTime('45min', 0, 45);
    checkExpectedTime('90min', 1, 30);
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

test('If an execption is thrown during date parsing, return the default date.', () => {
    var originalTest = RegExp.prototype.test; // Save the original implementation
    try {
        RegExp.prototype.test = function () { throw "MOCK"; }; // Force the error
        checkExpectedDate('', 2021, 0, 1);
    }
    finally {
        RegExp.prototype.test = originalTest; // Restore the original.
        expect(/test/.test('test')).toBe(true); // Because I'm paranoid.
    }
});

test('If an exception is thrown looking for days of the week, return false.', () => {
    var originalFind = Array.prototype.find;
    try {
        Array.prototype.find = function () { throw "MOCK"; };
        checkExpectedDate('wednesday', 2021, 0, 1); // Should return default date.
    }
    finally {
        Array.prototype.find = originalFind;
        [1, 2, 3].find((x) => true); // paranoia
    }

});

test('Default date should be today at 7pm', () => {
    var date = new DateParser().getDefaultDate();
    expect(date.getFullYear()).toBe(2021);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(19);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
});

/**
 * Should support relative time in days. Ex: "10days"
 * (Also supports the typo "7day")
 */
test('Honor relative time in days', () => {
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
