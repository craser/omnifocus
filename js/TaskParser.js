#!/Users/craser/.nvm/versions/node/v10.23.0/bin/node
const DateParser = require('./DateParser');

function parseTaskName(string) {
    var name = string.replace(/\b\s*\/\/.*$/, ''); // strip off trailing spaces, the //, and everything after.
    return name;
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

function getTagNames(string) {
    var tags = [];

    var taskName = parseTaskName(string);
    if (/expect/i.test(taskName)) {
        tags.push('waiting');
    }

    var meta = getMeta(string);
    meta.replace(/(\W|^)[#:](\w+)/g, function (m, W, t) {
        tags.push(t);
    });
    return tags;
}

function getPrimaryTagName(string) {
    var tagNames = getTagNames(string);
    return tagNames.length ? tagNames[0] : null;
}

function parseIsCompleted(string) {
    var meta = getMeta(string);
    var isDone = /\bdone\b/i.test(meta);
    return isDone;
}

function parseIsFlagged(string) {
    var meta = getMeta(string);
    var flagged = /\bflag(ged)?\b/i.test(meta);
    return flagged;
}

function formatPhone(string) {
    var digits = string.replace(/[^\d]/g, '');
    var phone = digits.replace(/(...)(...)(....)/, "($1) $2-$3");
    return phone;
}

function parsePhoneNumbers(string) {
    var re = /((\+1)?[(]*(\d{3})[).\s]*(\d{3})[.\s\-]*(\d{4}))/g;
    var phones = [];
    string.replace(re, function (p) {
        phones.push(formatPhone(p));
    });
    return phones;
}

function parseNote(string) {
    var note = string.replace(/^.*?(\/\*\*\s*|$)/, '');
    try {
        note += parsePhoneNumbers(string).map(p => `\np: ${p}`).join('');
    } catch (e) {
        note = string + '\n\n' + e.toString();
    }
    return note;
}

function parseContextSpec(string) {
    var meta = getMeta(string);

    var regex = /^.*?\.([^\s]+)\b.*$/;
    if (regex.test(string)) {
        var contextSpec = meta.replace(regex, '$1')
            .split('.')
            .filter(x => x != '');
        return contextSpec;
    } else {
        return [];
    }
}

function parseTask(string) {
    var task = {
        name: parseTaskName(string),
        tagNames: getTagNames(string),
        note: parseNote(string),
        dueDate: new DateParser().parseDueDate(string),
        flagged: parseIsFlagged(string),
        contextSpec: parseContextSpec(string),
        completed: parseIsCompleted(string),
        primaryTagName: getPrimaryTagName(string)
    }
    return task;
}

function TaskParser() {
    this.parseTask = parseTask;
}

module.exports = TaskParser;
