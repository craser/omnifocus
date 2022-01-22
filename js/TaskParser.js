#!/Users/craser/.nvm/versions/node/v10.23.0/bin/node

const DEFAULT_PROJECT = 'work';
const DEFAULT_PARENT_TASK = 'general';
const { exec } = require('child_process');


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
    } else {
        return null;
    }
}

function getDefaultDueDate() {
    var date = new Date();
    date.setHours(19, 0, 0); // 07:00 PM
    return date;
}

function parseDueDate(string) {
    try {
        var meta = getMeta(string);
        var date = parseDate(meta);
        var time = parseTime(meta);
        if (time) {
            date.setHours(time.hours, time.minutes, time.seconds);
        } else {
            date.setHours(19, 0, 0); // 07:00 PM // TODO: Pull h, m, s from getDefaultDate().
        }
        return date;
    } catch (e) {
        var date = getDefaultDueDate();
        return date;
    }
}

function getProject(OmniFocus, prjName) {
    try {
        var projects = OmniFocus.defaultDocument.projects.whose({ name: { _beginsWith: prjName } });
        var project = projects.length ? projects[0] : null;
        return project;
    } catch (e) {
        return null;
    }
}

function getTask(project, taskName){
    var tasks = project.tasks.whose({_and: [{name: { _beginsWith: taskName }}, {completed: { _equals: "false"}}]});
    var task = tasks.length ? tasks[0] : null;
    return task;
}

function getTag(OmniFocus, tagName) {
    try {
        var tags = OmniFocus.defaultDocument.tags.whose({ name: { _beginsWith: tagName } });
        var tag = tags[0]();
        return tag;
    } catch (e) {
        return null;
    }
}

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

function parsePrimaryTag(OmniFocus, name) {
    var tag = getTag(OmniFocus, name);
    return tag;
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

function createTag(OmniFocus, tagName) {
    var tag = OmniFocus.Tag({
        name: tagName
    });
    OmniFocus.defaultDocument.tags.push(tag);
    return tag;
}

function parseTags(OmniFocus, tagNames) {
    var tags = [];
    tagNames.forEach(function (tagName) {
        var found = OmniFocus.defaultDocument.tags.whose({ name: { _beginsWith: tagName }});
        var tag = (found.length) ? found()[0] : createTag(OmniFocus, tagName);
        tags.push(tag);
    });
    return tags;
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

function logTaskData(name, primaryTag, tags, dueDate) {
    try {
        console.log(`name    : ${name}`);
        console.log(`due     : ${dueDate}`);
        console.log(`primary : ${primaryTag ? primaryTag.name() : ''}`);
        console.log(`tags (${tags.length}) : [${tags.map(x => `'${x.name()}'`)}]`);
    } catch (e) {
        console.log(`error logging info: ${e}`);
    }
}

function ensureContext(OmniFocus, parent, context, task) {
    if (!context.length) {
        parent.tasks.push(task);
    } else {
        var child = getTask(parent, context[0], task);
        if (!child) {
            child = OmniFocus.Task({ name: context[0] });
            parent.tasks.push(child);
            ensureContext(OmniFocus, child, context.slice(1), task);
        } else {
            ensureContext(OmniFocus, child, context.slice(1), task);
        }
    }
}

function isDefaultProject(project) {
    var prjName = project.name().toLowerCase();
    var defName = DEFAULT_PROJECT.toLowerCase();
    var match = prjName == defName;
    return match;
}

/**
 * Resolves the given ".project.parent-task.subparent-task" context notation into an unambiguous path specifier.
 *   - the first item in the context is ALWAYS a project name. If the fist item in the notation is not
 *     a project name, DEFAULT_PROJECT is prepended.
 *   - IFF we've defaulted to the DEFAULT_PROJECT, AND no context is specified, DEFAULT_PARENT_TASK is appended.
 *
 *   EXAMPLES:
 *   - ''           ➤ [DEFAULT_PROJECT, DEFAULT_PARENT_TASK]
 *   - '.prj'       ➤ ['prj']
 *   - '.prj.task'  ➤ ['prj', 'task']
 *   - '.task'      ➤ [DEFAULT_PROJECT, 'task']
 *
 * @param OmniFocus
 * @param contextSpec
 * @return {*[]}
 */
function parseContext(OmniFocus, contextSpec) {
    var context = [];
    var project = getProject(OmniFocus, contextSpec[0]);
    if (!project) {
        context.push(DEFAULT_PROJECT); // first note in path should always be a project.
    } else {
        contextSpec.shift(); // discard the used name
        context.push(project.name()); // use the actual name
    }

    if ((context[0] == DEFAULT_PROJECT) && !contextSpec.length) {
        context.push(DEFAULT_PARENT_TASK);
    }

    context = context.concat(contextSpec);
    console.log(`context: [${context.map(x => `'${x}'`).join(', ')}]`);
    return context;
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

function addTaskToContext(OmniFocus, contextSpec, task) {
    var context = parseContext(OmniFocus, contextSpec);
    var project = getProject(OmniFocus, context[0]);
    if (project) {
        return ensureContext(OmniFocus, project, context.slice(1), task);
    } else {
        project = getProject(OmniFocus, DEFAULT_PROJECT);
        return ensureContext(OmniFocus, project, context, task);
    }
}

function parseTask(string) {
    var task = {
        name: parseTaskName(string),
        tagNames: getTagNames(string),
        note: parseNote(string),
        dueDate: parseDueDate(string),
        flagged: parseIsFlagged(string),
        contextSpec: parseContextSpec(string),
        completed: parseIsCompleted(string),
        primaryTagName: getPrimaryTagName(string)
    }
    return task;
}

function shell(cmd, f) {
    exec(cmd, function (error, stdout, stderr) {
        f(stdout.trim());
    });
}

function createOmniFocusTask(task) {
    var json = JSON.stringify(task);
    console.log(`json: ${json}`);
    shell(`json-to-task '${json}'`, function (text) {
        console.log(text);
    })
}

function run(argv) {
    try {
        console.log('################################################################################');
        console.log(`creating new task: ${new Date()}`);
        console.log(`input: "${argv[0]}"`);
        var string = argv[0];
        var task = parseTask(string);
        createOmniFocusTask(task);
        console.log('task created');
    } catch (e) {
        console.log(`error creating task: ${e}`);
        console.log(e);
    }
}

//run(process.argv.slice(2));

module.exports = {
    parseTask: parseTask,
    parseDate: parseDate
}