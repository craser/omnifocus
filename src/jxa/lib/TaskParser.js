import DateParser from './DateParser';
import ContextParser from './ContextParser';
import NoteParser from './NoteParser';
import RuleManager from './RuleManager';

function parseTaskName(string) {
    var name = string.replace(/\s*\/\/.*$/, ''); // strip off trailing spaces, the //, and everything after.
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

function getTagNames(meta) {
    var tags = [];
    meta.replace(/(\W|^)[#:]([\w\-]+)/g, function (m, W, t) {
        tags.push(t);
    });
    return tags;
}

function getPrimaryTagName(meta) {
    var tagNames = getTagNames(meta);
    return tagNames.length ? tagNames[0] : null;
}

function parseIsCompleted(string) {
    var meta = getMeta(string);
    var isDone = /\bdone\b/i.test(meta);
    return isDone;
}

function parseIsFlagged(string) {
    var meta = getMeta(string);
    if (/\bflag(ged)?\b/i.test(meta)) {
        return true;
    } else if (/\bnext\b/i.test(meta)) {
        return true;
    } else {
        return false;
    }
}

export default class TaskParser {
    constructor() {
        this.rulesManager = new RuleManager();
    }

    parse(string) {
        var meta = getMeta(string);
        let isCompleted = parseIsCompleted(string);
        var task = {
            name: parseTaskName(string),
            meta: meta,
            tagNames: getTagNames(meta),
            note: new NoteParser().parse(string),
            dueDate: new DateParser().parseDueDate(meta),
            flagged: parseIsFlagged(string),
            contextSpec: new ContextParser().parse(meta),
            completed: isCompleted,
            completionDate: (isCompleted ? new Date() : null),
            primaryTagName: getPrimaryTagName(meta)
        }
        task = this.rulesManager.applyRules(task);
        return task;
    }
}
