#!/Users/craser/.nvm/versions/node/v10.23.0/bin/node
const DateParser = require('./DateParser');
const ContextParser = require('./ContextParser');
const NoteParser = require('./NoteParser');

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

function parseTask(string) {
    var meta = getMeta(string);
    var task = {
        name: parseTaskName(string),
        tagNames: getTagNames(string),
        note: new NoteParser().parse(string),
        dueDate: new DateParser().parseDueDate(string),
        flagged: parseIsFlagged(string),
        contextSpec: new ContextParser().parse(meta),
        completed: parseIsCompleted(string),
        primaryTagName: getPrimaryTagName(string)
    }
    return task;
}

function TaskParser() {
    this.parse = parseTask;
}

module.exports = TaskParser;
