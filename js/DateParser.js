'use strict'

const DAYS_OF_WEEK = [
    new DayOfWeek('sunday', /(sun|sunday)/i, 0),
    new DayOfWeek('monday', /(mon|monday)/i, 1),
    new DayOfWeek('tuesday', /(tues|tuesday)/i, 2),
    new DayOfWeek('wednesday', /(wed|wednesday)/i, 3),
    new DayOfWeek('thursday', /(thr|thrs|thurs|thursday)/i, 4),
    new DayOfWeek('friday', /(fri|friday)/i, 5),
    new DayOfWeek('saturday', /(sat|saturday)/i, 6),
];

function DayOfWeek(name, pattern, index) {
    this.name = name;
    this.pattern = pattern;
    this.index = index;
}

/**
 * TODO: REMOVE getDefaultDate()
 * Keeping this just for debugging, but should
 * be replaced with basic `new Date()` call.
 * @return Date - now.
 */
function getDefaultDate() {
    var date = new Date();
    return date;
}

function parseDayOfWeek(meta) {
    var date = new Date();
    DAYS_OF_WEEK.forEach(function (day) {
        if (day.pattern.test(meta)) {
            var current = new Date().getDay()
            var offset = (day.index + 7 - current) % 7;
            date.setDate(date.getDate() + offset);
        }
    });
    return date;
}

function parseBaseDate(meta) {
    if (/today/i.test(meta)) {
        var date = new Date();
        return date;
    } else if (/tomorrow/i.test(meta)) {
        var date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    } else if (/tmw/i.test(meta)) {
        var date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    } else if (hasDayOfWeek(meta)) {
        var date = parseDayOfWeek(meta);
        return date;
    } else if (/(\d{1,2})\/(\d{1,2})(\/(\d{2,4}))?/.test(meta)) {
        var line = meta.match(/(\d{1,2})\/(\d{1,2})(\/(\d{2,4}))?/);
        var month = line[1];
        var day = line[2];
        var year = line[4] || new Date().getFullYear();
        var date = getDefaultDate();
        date.setMonth(parseInt(month) - 1);
        date.setDate(day);
        date.setFullYear(year);
        return date;
    }
}

function applyDateSpecifier(baseDate, meta) {
    let specifiedDate = parseBaseDate(meta);
    if (specifiedDate) {
        baseDate = baseDate || getDefaultDate();
        baseDate.setFullYear(specifiedDate.getFullYear());
        baseDate.setMonth(specifiedDate.getMonth());
        baseDate.setDate(specifiedDate.getDate());
    }
    return baseDate;
}

function applyDateModifiers(baseDate, meta) {
    let modDate = baseDate || getDefaultDate();
    if (/next/i.test(meta)) {
        modDate.setDate(new Date().getDate());
        return modDate;
    } else if (/[+-]?\d+\s?days?/i.test(meta)) {
        var line = meta.match(/([+-]?\d+)\s?days?/i);
        var days = parseInt(line[1]);
        modDate.setDate(modDate.getDate() + days);
        return modDate;
    } else if (/[+-]?\d+\s?weeks?/i.test(meta)) {
        var line = meta.match(/([+-]?\d+)\s?weeks?/i);
        var days = parseInt(line[1]) * 7;
        modDate.setDate(modDate.getDate() + days);
        return modDate;
    } else {
        return baseDate;
    }
}

function hasDayOfWeek(meta) {
    try {
        var found = DAYS_OF_WEEK.find(function (day) {
            return day.pattern.test(meta);
        });
        return !!found;
    } catch (e) {
        return false;
    }
}

/**
 * Retrieves a time string from the given metadata string.
 * @param meta
 * @returns {string} Formatted time string (ex: '4:33 PM')
 */
function parseTime(meta) {
    if (/\d+\s?hrs?/i.test(meta)) {
        var line = meta.match(/(\d+)\s?hrs?/i);
        var hours = parseInt(line[1]);
        var date = new Date();
        date.setHours(date.getHours() + hours);
        return {
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: 0
        };
    } else if (/\d+\s?mins?/i.test(meta)) {
        var line = meta.match(/(\d+)\s?mins?/i);
        var minutes = parseInt(line[1]);
        var date = new Date();
        date.setMinutes(date.getMinutes() + minutes);
        return {
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: 0
        };
    } else if (/(\d{1,2})(:(\d\d))?\s*(am|pm)/i.test(meta)) {
        var line = meta.match(/(\d{1,2})(:(\d\d))?\s*(am|pm)/i);
        var offset = /pm/i.test(line[4]) ? 12 : 0;
        var hours = (parseInt(line[1]) %12) + offset;
        var minutes = line[3] ? parseInt(line[3]) : 0;
        return {
            hours: hours,
            minutes: minutes,
            seconds: 0
        };
    } else if (/\bnow\b/i.test(meta)) {
        var now = new Date();
        return {
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: 0
        };
    } else if (/next/i.test(meta)) {
        var now = new Date();
        return {
            hours: now.getHours(),
            minutes: now.getMinutes(),
            seconds: 0
        };
    } else {
        return null;
    }
}

function applyTime(baseDate, meta) {
    var time = parseTime(meta);
    if (time) {
        baseDate = baseDate || getDefaultDate();
        baseDate.setHours(time.hours, time.minutes, time.seconds);
    }
    return baseDate;
}

function parseDueDate(meta) {
    try {
        let baseDate = parseBaseDate(meta) || null;
        let modeDate = applyDateModifiers(baseDate, meta);
        let timeDate = applyTime(modeDate, meta);
        return timeDate;
    } catch (e) {
        return null;
    }
}

function overrideDueDate(currentDueDate, baseMeta, overrideMeta) {
    // oddball special case: if the override is null, that means
    // we're clearing the due date UNLESS there's a base date
    let specifiedDate = parseBaseDate(baseMeta);
    if (!specifiedDate && !overrideMeta) {
        return null;
    }

    let dueDate = currentDueDate;
    dueDate = applyDateSpecifier(dueDate, overrideMeta);
    dueDate = applyDateSpecifier(dueDate, baseMeta);
    dueDate = applyDateModifiers(dueDate, overrideMeta);
    dueDate = applyDateModifiers(dueDate, baseMeta);
    dueDate = applyTime(dueDate, overrideMeta);
    dueDate = applyTime(dueDate, baseMeta);
    return dueDate;
}

function DateParser() {
    this.parseDueDate = parseDueDate;
    this.parseTime = parseTime; // exposed only for testing. TODO: remove
    this.overrideDueDate = overrideDueDate;
}

module.exports = DateParser;
