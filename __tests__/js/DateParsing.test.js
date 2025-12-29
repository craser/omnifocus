const DateParser = require('src/jxa/lib/DateParser');

function checkExpectedDay(specifiers, expectedDayIndex) {
    specifiers.forEach((input) => {
        var date = new DateParser().parseDueDate(input);
        expect(date.getDay()).toBe(expectedDayIndex);
        expect(date.getTime()).toBeGreaterThanOrEqual(new Date().getTime()); // calls mocked Date.
    })
}

function expectDate(date, expectedYear, expectedMonth, expectedDate) {
    expect(date.getFullYear()).toBe(expectedYear);
    expect(date.getMonth()).toBe(expectedMonth);
    expect(date.getDate()).toBe(expectedDate);
}

function checkExpectedDate(specifier, expectedYear, expectedMonth, expectedDate) {
    var date = new DateParser().parseDueDate(specifier);
    expectDate(date, expectedYear, expectedMonth, expectedDate);
}

function checkExpectedTime(specifier, expectedHours, expectedMinutes) {
    var time = new DateParser().parseTime(specifier);
    expect(time.hours).toBe(expectedHours);
    expect(time.minutes).toBe(expectedMinutes);
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2021-01-01T08:00:00.000Z'));
});

afterEach(() => {
    jest.useRealTimers();
})

test('parseTask should correctly interpret "now" as due date', () => {
    var now = new Date();
    checkExpectedTime('now', now.getHours(), now.getMinutes());
});

test('parseTask should correctly interpret "tomorrow" as due date', () => {
    // new Date() always returns 1/1/2021 at 12:00 AM, PST
    checkExpectedDate('tomorrow', 2021, 0, 2);
});

test('parseTask should correctly interpret "tmw" as due date', () => {
    // new Date() always returns 1/1/2021 at 12:00 AM, PST
    checkExpectedDate('tmw', 2021, 0, 2);
});

test('Honor ex. 10pm as time spec', () => {
    checkExpectedTime('9am', 9, 0);
    checkExpectedTime('9:00am', 9, 0);
    checkExpectedTime('10pm', 22, 0); // PM
    checkExpectedTime('10:00pm', 22, 0); // PM
});

test('Honor relative time in hrs', () => {
    checkExpectedTime('9hrs', 9, 0); // basic
    checkExpectedTime('15hrs', 15, 0); // cross to PM
    checkExpectedTime('30hrs', 6, 0); // cross to next day
});

test('Honor relative time in min', () => {
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

test('If an execption is thrown during date parsing, return null.', () => {
    var originalTest = RegExp.prototype.test; // Save the original implementation
    try {
        RegExp.prototype.test = function () { throw "MOCK"; }; // Force the error
        var date = new DateParser().parseDueDate('');
        expect(date).toBeNull();
    }
    finally {
        RegExp.prototype.test = originalTest; // Restore the original.
        expect(/test/.test('test')).toBe(true); // Because I'm paranoid.
    }
});

test('If no date/time is specified, returned date should be null', () => {
     // default both date and time
    let date = new DateParser().parseDueDate('');
    expect(date).toBeNull();
});

test('If only a time is specified, date should be flagged with isDefaultDate, but NOT isDefaultTime', () => {
    let date = new DateParser().parseDueDate('4pm');
    checkExpectedDate('4pm', 2021, 0, 1);
    checkExpectedTime('4pm', 16, 0);
});

test('If an exception is thrown looking for days of the week, return false.', () => {
    var originalFind = Array.prototype.find;
    try {
        Array.prototype.find = function () { throw "MOCK"; };
        var date = new DateParser().parseDueDate('wednesday');
        expect(date).toBeFalsy();
    }
    finally {
        Array.prototype.find = originalFind;
        [1, 2, 3].find((x) => true); // paranoia
    }

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

test('Honor relative time in weeks', () => {
    checkExpectedDate('1week', 2021,0, 8);
    checkExpectedDate('3weeks', 2021,0, 22);
});

test('Honor relative time in months', () => {
    checkExpectedDate('1month', 2021, 1, 1);
    checkExpectedDate('3months', 2021, 3, 1);
    checkExpectedDate('12months', 2022, 0, 1);
    checkExpectedDate('17months', 2022, 5, 1);
});

test('Honor relative time in years', () => {
    checkExpectedDate('1year', 2022, 0, 1);
    checkExpectedDate('3years', 2024, 0, 1);
});

test('Honor m/d/y date specifiers', () => {
    // Without a year, should parse to a date in the future.
    checkExpectedDate('5/15', 2021, 4, 15);
    checkExpectedDate('05/15', 2021, 4, 15);
    // CAN specify a date in the past.
    checkExpectedDate('5/15/2002', 2002, 4, 15);
});

test('Nullify due date unless originally specified', () => {
    let parser = new DateParser();
    let date = parser.overrideDueDate(null, '7/22/2023', null);
    expect(date).not.toBeNull();
    expectDate(date, 2023, 6, 22);
});

test('Override due date', () => {
    let parser = new DateParser();
    let date = parser.overrideDueDate(null, '7/22/2023', '8/17/2024');
    expect(date).not.toBeNull();
    expectDate(date, 2023, 6, 22);
});

