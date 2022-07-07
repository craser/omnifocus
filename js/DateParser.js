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
 * @return Date - Today at 7PM.
 */
function getDefaultDate() {
    var date = new Date();
    date.setHours(19, 0, 0);
    date.isDefaultDate = true;
    date.isDefaultTime = true;
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

/**
 * Retrieves a Date object from the given metadata string.
 * @param meta
 * @returns {Date} Formatted date. (ex: 01/14/2021)
 */
function parseDate(meta) {
    try {
        if (/\d+\s?days?/i.test(meta)) {
            var line = meta.match(/(\d+)\s?days?/i);
            var days = parseInt(line[1]);
            var date = new Date();
            date.setDate(date.getDate() + days);
            return date;
        } else if (/tomorrow/i.test(meta)) {
            var date = new Date();
            date.setDate(date.getDate() + 1);
            return date;
        } else if (hasDayOfWeek(meta)) {
            var date = parseDayOfWeek(meta);
            return date;
        } else if (meta.match(/(\d{1,2})\/(\d{1,2})(\/(\d{2,4}))?/)) {
            var line = meta.match(/(\d{1,2})\/(\d{1,2})(\/(\d{2,4}))?/);
            var month = line[1];
            var day = line[2];
            var year = line[4] || new Date().getFullYear();
            var date = getDefaultDate();
            date.setMonth(parseInt(month) - 1);
            date.setDate(day);
            date.setFullYear(year);
            date.isDefaultDate = false;
            return date;
        } else {
            return getDefaultDate();
        }
    } catch (e) {
        return getDefaultDate();
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
    } else {
        return null;
    }
}

function parseDueDate(meta) {
    try {
        var date = parseDate(meta);
        var time = parseTime(meta);
        if (time) {
            date.isDefaultTime = false;
            date.setHours(time.hours, time.minutes, time.seconds);
        } else {
            date.isDefaultTime = true;
            date.setHours(19, 0, 0); // 07:00 PM // TODO: Pull h, m, s from getDefaultDate().
        }
        return date;
    } catch (e) {
          var date = getDefaultDate();
        return date;
    }
}

/**
 * Retrieves the metadata portaion (everything after the '//') from the input string.
 * @param string
 * @returns {*}
 */
function getMeta(string) {
    var meta = string.replace(/^.*?((\/\/.*?)(\/\*\*.*|$)|$)/, '$2');
    return meta;
}

function DateParser() {
    this.parseDueDate = parseDueDate;
    this.parseDate = parseDate;
    this.parseTime = parseTime;
    this.getDefaultDate = getDefaultDate;
}

module.exports = DateParser;
