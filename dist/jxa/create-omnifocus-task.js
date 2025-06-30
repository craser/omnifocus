#!/usr/bin/env osascript -l JavaScript
'use strict';

const DAYS_OF_WEEK = [
    new DayOfWeek('sunday', /\b(sun|sunday)\b/i, 0),
    new DayOfWeek('monday', /\b(mon|monday)\b/i, 1),
    new DayOfWeek('tuesday', /\b(tues|tuesday)\b/i, 2),
    new DayOfWeek('wednesday', /\b(wed|wednesday)\b/i, 3),
    new DayOfWeek('thursday', /\b(thr|thrs|thurs|thursday)\b/i, 4),
    new DayOfWeek('friday', /\b(fri|friday)\b/i, 5),
    new DayOfWeek('saturday', /\b(sat|saturday)\b/i, 6),
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
            var current = new Date().getDay();
            var offset = (day.index + 7 - current) % 7;
            date.setDate(date.getDate() + offset);
        }
    });
    return date;
}

function parseBaseDate(meta) {
    if (/\bnow\b/i.test(meta)) {
        var date = new Date();
        return date;
    } else if (/today/i.test(meta)) {
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
        baseDate.setYear(specifiedDate.getFullYear());
        baseDate.setMonth(specifiedDate.getMonth());
        baseDate.setDate(specifiedDate.getDate());
    }
    return baseDate;
}

function applyDateModifiers(baseDate, meta) {
    let modDate = baseDate || getDefaultDate();
    if (/\bnow\b/i.test(meta)) {
        var now = new Date();
        modDate.setYear(now.getFullYear());
        modDate.setMonth(now.getMonth());
        modDate.setDate(now.getDate());
        return modDate;
    } else if (/next/i.test(meta)) {
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
    } else if (/[+-]?\d+\s?months?/i.test(meta)) {
        var line = meta.match(/([+-]?\d+)\s?months?/i);
        var months = parseInt(line[1]);
        modDate.setMonth(modDate.getMonth() + months);
        return modDate;
    } else if (/[+-]?\d+\s?years?/i.test(meta)) {
        var line = meta.match(/([+-]?\d+)\s?years?/i);
        var years = parseInt(line[1]);
        modDate.setYear(modDate.getFullYear() + years);
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

class DateParser {
    parseDueDate(meta) {
        return parseDueDate(meta);
    }

    parseTime(meta) {
        return parseTime(meta);
    }

    overrideDueDate(currentDueDate, baseMeta, overrideMeta) {
        return overrideDueDate(currentDueDate, baseMeta, overrideMeta);
    }
}

var DateParser_1 = DateParser;

function consumeUnquotedSegment(meta, i, spec) {
    let segment = '';
    for (; i < meta.length; i++) {
        if (meta[i] === ' ') { // end of spec
            spec.push(segment);
            segment = '';
            i--; // back up so that the spec delimiter is visible
            break;
        } else if (meta[i] === '.') { // end of segment
            spec.push(segment);
            segment = '';
            i--; // back up so that the spec delimiter is visible
            break;
        } else {
            segment += meta[i];
        }
    }
    
    if (segment) {
        spec.push(segment);
    }
    return i;
}

// This one does double-duty parsing both quoted segments and segments within quoted specs, hence the check for .
function consumeQuotedSegment(meta, i, spec, quote) {
    let segment = '';
    for (; i < meta.length; i++) {
        if (meta[i] === '.') { // end of segment
            spec.push(segment);
            segment = '';
            i--; // back up so that the spec delimiter is visible
            break;
        } else if (meta[i] === quote) { // end of segment
            spec.push(segment);
            segment = '';
            // leave i alone
            break;
        } else {
            segment += meta[i];
        }
    }
    
    if (segment) {
        spec.push(segment);
    }
    return i;
}


function consumeSpec(meta, i, spec) {
    for (; i < meta.length; i++) {
        if (meta[i] === ' ') { // end of spec
            break;
        } else if (meta[i] === '.') { // beginning of spec/segment
            continue;
        } else if (meta[i] === "'" || meta[i] === '"') {
            i = consumeQuotedSegment(meta, i + 1, spec, meta[i]);
        } else {
            i = consumeUnquotedSegment(meta, i, spec);
        }
    }
    return spec;
}

function consumeQuotedSpec(meta, i, spec, quote) {
    for (; i < meta.length; i++) {
        if (meta[i] === quote) { // end of spec
            break;
        } else if (meta[i] === '.') {
            continue;
        } else {
            i = consumeQuotedSegment(meta, i, spec, quote);
        }
    }
    return spec;
}


function consumeMeta(meta) {
    var spec = [];
    for (var i = 0; i < meta.length; i++) {
        if (meta[i] === '.') {
            consumeSpec(meta, i, spec);
            break;
        } else if ((meta[i] === "'" || meta[i] === '"') && meta[i + 1] === '.') { // beginning of spec
            consumeQuotedSpec(meta, i+1, spec, meta[i]);
            break;
        } else if ((meta[i] === "'" || meta[i] === '"')) { // beginning of some other quoted thing
            var quote = meta[i++];
            while (meta[i++] != quote);
        }
    }
    return spec;
}

class ContextParser {
    parse(meta) {
        return consumeMeta(meta);
    }
}

var ContextParser_1 = ContextParser;

/**
 * Assumes a 10-digit phone number (with optional +1 prefix) like those used in the US.
 * @param string - should be just the string recognized as a phone number
 * @return string - phone number formatted as (000) 000-0000
 */
function formatPhone(string) {
    var digits = string.replace(/[^\d]/g, '');
    var phone = digits.replace(/(...)(...)(....)/, "($1) $2-$3");
    return phone;
}

function parsePhoneNumbers(string) {
    var re = /((\s|^)(\+1)?[(]*(\d{3})[).\s]*(\d{3})[.\s\-]*(\d{4})(\s|$))/g;
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

class NoteParser {
    parse(string) {
        return parseNote(string);
    }
}

var NoteParser_1 = NoteParser;

class CmdRunner {
    execSync(cmd, args) {
        const script = [cmd, ...args].map(s => `'${s}'`).join(' ');
        const a = Application.currentApplication();
        a.includeStandardAdditions = true;
        const stdout = a.doShellScript(`${script} 2>&1`);
        const exitCodeString = a.doShellScript('echo $?');
        const exitCode = parseInt(exitCodeString);
        
        console.log(`doScript: ${script}`);
        console.log(`stdout: ${stdout}`);
        console.log(`exitCode (string): ${exitCodeString}`);
        console.log(`exitCode (parsed): ${exitCode}`);
        
        
        if (exitCode !== 0) {
            throw new Error(stdout.join('\n'));
        }
        return stdout;
    } catch (error) {
        console.log(`doScript error: ${error}`);
        throw error;
    }
}

var CmdRunner_1 = CmdRunner;

const dateParser = new DateParser_1();

function getRegex(descriptor) {
    const isRegex = /\/(?<pattern>.*)\/(?<flags>[gimy])*$/;
    if (isRegex.test(descriptor)) {
        const { pattern, flags } = descriptor.match(isRegex).groups;
        return new RegExp(pattern, flags);
    } else {
        // Treat the whole string as the pattern, no flags
        return new RegExp(descriptor);
    }
}

function parsePattern(descriptor) {
    let regex = getRegex(descriptor);
    return function (string) {
        return regex.test(string)
            ? string.match(regex)[0] // also functions as truthy
            : false; // indicates no match
    };
}

function evaluate(value, task) {
    if (typeof value == 'string') {
        return value;
    } else if ('match' in value) {
        return test(value.match, task);
    } else if ('concatenate' in value) {
        return value.concatenate.map((v) => evaluate(v, task)).join('');
    } else if ('script' in value) {
        let spec = value['script'];
        let args = spec.args.map((arg) => evaluate(arg, task));
        return new CmdRunner_1().execSync(spec.command, args)
    } else {
        return value;
    }
}

// remove duplicates in a list
function uniq(list) {
    return list.filter((item, index) => list.indexOf(item) == index);
}

function act(action, task) {
    if ('tag' in action) {
        task.tagNames.push(action.tag); // prepend to list
        if (task.primaryTagName == null) {
            task.primaryTagName = action.tag; // update primary tag to reflect that the new tag is at the head of the
                                              // list
        }
    } else if ('project' in action) {
        let project = evaluate(action.project, task);
        task.contextSpec.unshift(project);
        task.contextSpec = uniq(task.contextSpec);
    } else if ('parent' in action) {
        let parent = evaluate(action.parent, task);
        task.contextSpec.push(parent);
        task.contextSpec = uniq(task.contextSpec);
    } else if ('due' in action) {
        task.dueDate = dateParser.overrideDueDate(task.dueDate, task.meta, action.due);
    } else if ('remove-tag' in action) {
        task.tagNames = task.tagNames.filter(tag => tag != action['remove-tag']);
        task.primaryTagName = task.tagNames[0] || null;
    }
    return task;
}

function test(condition, task) {
    function applyCondition(condition, task) {
        if ('value' in condition) { // mostly for testing
            return condition.value;
        } else if ('or' in condition) {
            return condition.or.reduce((a, condition) => a || test(condition, task), false);
        } else if ('and' in condition) {
            return condition.and.reduce((a, condition) => a && test(condition, task), true);
        } else if ('not' in condition) {
            return !test(condition.not, task);
        } else if ('name' in condition) {
            return parsePattern(condition.name)(task.name);
        } else if ('project' in condition) {
            return parsePattern(condition.project)(task.contextSpec[0]);
        } else if ('tag' in condition) {
            return hasTag(task, condition.tag);
        } else if ('default-date' in condition) {
            return true; // FIXME: DO NOT COMMIT TO CODE REPOSITORY!
        } else if ('default-time' in condition) {
            return true; // FIXME: DO NOT COMMIT TO CODE REPOSITORY!
        } else if ('no-project' in condition) {
            return condition["no-project"]
                ? task.contextSpec.length == 0
                : task.contextSpec.length > 0;
        } else if ('no-parent' in condition) {
            return condition["no-parent"]
                ? task.contextSpec.length == 1
                : task.contextSpec.length > 1;
        } else {
            throw new Error('Unknown condition: ' + JSON.stringify(condition));
        }
    }
    
    let result = applyCondition(condition, task);
    console.log(`test: ${JSON.stringify(condition)} => ${result}`);
    return result;
}

function hasTag(task, tag) {
    return task.tagNames.find((t) => t.toLowerCase() == tag.toLowerCase());
}

class Rule {
    constructor(config) {
        this.config = config;
    }
    
    apply(task) {
        console.log(`applying rule: ${this.config.name}`);
        if (test(this.config.condition, task)) {
            console.log(`    rule matched: ${this.config.name}`);
            this.config.actions.forEach(action => {
                console.log(`        action: ${JSON.stringify(action)}`);
                task = act(action, task);
            });
        }
        console.log(`result: ${JSON.stringify(task)}`);
        return task;
    }
}

function getUserHomeDir() {
    ObjC.import('stdlib'); // TODO: consolidate this into a single import statement?
    const home = $.getenv('HOME');
    return home;
}

function doScript(script) {
    try {
        const a = Application.currentApplication();
        a.includeStandardAdditions = true;
        const stdout = a.doShellScript(`${script} 2>&1`);
        const exitCodeString = a.doShellScript('echo $?');
        const exitCode = parseInt(exitCodeString);

        console.log(`doScript: ${script}`);
        console.log(`stdout: ${stdout}`);
        console.log(`exitCode (string): ${exitCodeString}`);
        console.log(`exitCode (parsed): ${exitCode}`);


        if (exitCode !== 0) {
            throw new Error(stdout.join('\n'));
        }
        return stdout;
    } catch (error) {
        console.log(`doScript error: ${error}`);
        throw error;
    }
}

/**
 * Nodes's fs module is not available in the osascript runtime, and dealing with AppleScript's is painful, so
 * I'm just gonna wrap up some shell commands.
 */

/**
 * Resolves things like ~ and $HOME to the full path.
 * @param path
 */
function resolvePath(path) {
    if (!path) {
        return path;
    } else {
        path = path.replace(/^~/, getUserHomeDir());
        path = path.replace(/^\$HOME/, getUserHomeDir());
        return path;
    }
}

/**
 * Returns the contents of the file at the specified path as a single string.
 *
 * @param path
 * @returns {string} - The contents of the file at the specified path.
 */
function cat(path) {
    path = resolvePath(path);
    const contents = doScript(`cat "${path}"`);
    if (!contents) {
        throw new Error(`File not found: ${path}`);
    }
    return contents;
}

var description = "Config file for OmniFocus-related quick entry & command-line utilities.";
var github = "https://github.com/craser/omnifocus";
var rules = [
	{
		name: "All tasks due today by 7pm by default.",
		condition: {
			value: true
		},
		actions: [
			{
				due: "today 7pm"
			}
		]
	},
	{
		name: "Tasks in movies or reading have no default due date.",
		condition: {
			or: [
				{
					project: "/\\bmovies\\b/i"
				},
				{
					project: "/\\breading\\b/i"
				}
			]
		},
		actions: [
			{
				due: null
			}
		]
	},
	{
		name: "Put Jira tickets in .work project",
		condition: {
			or: [
				{
					project: "/\\b\\w{2,4}-\\d{3,4}\\b/"
				},
				{
					name: "/\\b\\w{2,4}-\\d{3,4}\\b/"
				}
			]
		},
		actions: [
			{
				project: "work"
			}
		]
	},
	{
		name: "Put Jira tickets in a ticket-specific parent task",
		condition: {
			or: [
				{
					name: "/\\b\\w{2,4}-\\d{3,4}\\b/"
				}
			]
		},
		actions: [
			{
				parent: {
					concatenate: [
						{
							match: {
								name: "/\\b\\w{2,4}-\\d{3,4}\\b/"
							}
						},
						": ",
						{
							script: {
								command: "/Users/craser/bin/tickets/tk-get-jira-title",
								args: [
									{
										match: {
											name: "/\\b\\w{2,4}-\\d{3,4}\\b/"
										}
									}
								]
							}
						}
					]
				}
			}
		]
	},
	{
		name: "Default empty context to work project",
		condition: {
			"no-project": true
		},
		actions: [
			{
				project: "work"
			},
			{
				parent: "general"
			}
		]
	},
	{
		name: "Default work tasks to general parent task",
		condition: {
			and: [
				{
					project: "/\\bwork\\b/"
				},
				{
					"no-parent": true
				}
			]
		},
		actions: [
			{
				parent: "general"
			}
		]
	},
	{
		name: "Tag expected tasks as :waiting, due at 10pm",
		condition: {
			name: "/expect/i"
		},
		actions: [
			{
				tag: "waiting"
			},
			{
				due: "10pm"
			}
		]
	},
	{
		name: ":waiting tasks are due at 10pm",
		condition: {
			tag: "waiting"
		},
		actions: [
			{
				due: "10pm"
			}
		]
	},
	{
		name: "Work tasks due at 3pm",
		condition: {
			and: [
				{
					project: "/\\bwork\\b/"
				}
			]
		},
		actions: [
			{
				due: "3pm"
			}
		]
	},
	{
		name: "Housekeeping tasks due at 11am",
		condition: {
			and: [
				{
					project: "/\\bhouse(keeping)?\\b/"
				},
				{
					"default-time": true
				}
			]
		},
		actions: [
			{
				due: "11am"
			}
		]
	},
	{
		name: "Errands due at 11am",
		condition: {
			and: [
				{
					tag: "errands"
				}
			]
		},
		actions: [
			{
				due: "11am"
			}
		]
	},
	{
		name: "Not-due tasks have no due date",
		condition: {
			tag: "notdue"
		},
		actions: [
			{
				due: null
			},
			{
				"remove-tag": "notdue"
			}
		]
	}
];
var defaultConfig = {
	description: description,
	github: github,
	rules: rules
};

function loadUserConfig() {
    try {
        const home = process.env['HOME'];
        const configPath = `${home}/.ofq-config.json`;
        const json = cat(configPath);
        const config = JSON.parse(json);
        return config;
    } catch (e) {
        return {}
    }
}

function loadConfig() {
    let userConfig = loadUserConfig();
    const config = Object.assign(defaultConfig, userConfig);
    return config;
}

class ParserConfig {
    constructor() {
        this.config = loadConfig();
    }

    getRulesConfig() {
        return this.config.rules || [];
    }
}

/**
 * My day is currently blocked out like this:
 *     - 08:30am: morning meeting
 *     - 09:00am: breakfast, email, Slack
 *     - 09:30am: coffee, headphones, code
 *             OR
 *            errands
 *     - 11:00am: ride
 *     - 01:00pm: lunch, Slack
 *     - 02:00pm: coffee, headphones, code
 *     - 04:00pm: dad stuff
 *
 * Ideally, I'd like my daily to-do list to appear in chronological
 * order. So let's try this:
 *     - :errands ➤ due at 11am
 *     - .work ➤ due at 3pm
 *     - :housekeeping ➤ due at 9pm
 *     - :waiting ➤ due at 10pm
 *
 *
 * Going to hard-code this for now & refactor later in my copious free time.
 *
 * RULES:
 *     ✓ default project: work
 *     ✓ default parent task: general
 *     ✓ default due date: today (implemented in DateParser)
 *     ✓ default due time: 7pm (in DateParser)
 *     ✓ :errands ➤ due at 11am
 *     ✓ .housekeeping ➤ due at 11am
 *     ✓ .work ➤ due at 3pm
 *     ✓ :waiting ➤ due at 10pm
 *     ✓ :notdue ➤ remove due date, AND remove :notdue tag
 *     ✓ tasks with Jira tickets in name get that ticket injected into context spec
 *
 * TODO: (follow-up)
 *     - remove default date & time logic from DateParser
 *     - remove implementation of above rules from RuleManager

 * @return {{}}
 */
class RuleManager {
    constructor() {
        let config = new ParserConfig();
        this.rules = this.parseRules(config.getRulesConfig());
    }

    applyRules(task) {
        this.rules.forEach((rule) => {
            task = rule.apply(task);
        });
        return task;
    }

    parseRules(rulesConfig) {
        return rulesConfig.map(rule => new Rule(rule));
    }
}

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

class TaskParser {
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
            note: new NoteParser_1().parse(string),
            dueDate: new DateParser_1().parseDueDate(meta),
            flagged: parseIsFlagged(string),
            contextSpec: new ContextParser_1().parse(meta),
            completed: isCompleted,
            completionDate: (isCompleted ? new Date() : null),
            primaryTagName: getPrimaryTagName(meta)
        };
        task = this.rulesManager.applyRules(task);
        return task;
    }
}

const DEFAULT_PROJECT = 'work';
const DEFAULT_PARENT_TASK = 'general';


function getProject(OmniFocus, prjName) {
    try {
        var projects = OmniFocus.defaultDocument.flattenedProjects.whose({ name: { _beginsWith: prjName } });
        var project = projects.length ? projects[0]() : null;
        return project;
    } catch (e) {
        console.log(e);
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

function parsePrimaryTag(OmniFocus, name) {
    var tag = getTag(OmniFocus, name);
    return tag;
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

function ensureContext(OmniFocus, parent, context, task) {
    if (!context.length) {
        parent.tasks.push(task);
    } else {
        var child = getTask(parent, context[0]);
        if (!child) {
            child = OmniFocus.Task({ name: context[0] });
            parent.tasks.push(child);
            ensureContext(OmniFocus, child, context.slice(1), task);
        } else {
            ensureContext(OmniFocus, child, context.slice(1), task);
        }
    }
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
    console.log(`contextSpec: [${contextSpec.map(x => `'${x}'`).join(', ')}]`);
    var project = getProject(OmniFocus, contextSpec[0]);
    if (!project) {
        console.log(`no project found for '${contextSpec[0]}'`);
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

function createOmniFocusTask(task) {
    var OmniFocus = Application('OmniFocus'); // TODO: Move all references to "string" above this line, and all refs to "Omnifocus" below this line.
    var primaryTag = parsePrimaryTag(OmniFocus, task.primaryTagName);
    var tags = parseTags(OmniFocus, task.tagNames);
    var omniFocusTask = OmniFocus.Task({
        name: task.name,
        primaryTag: task.completed ? null : primaryTag, // OmniFocus chokes on completed tasks with a primary tag.
        dueDate: task.dueDate,
        note: task.note,
        completed: task.completed,
        flagged: task.flagged,
        completionDate: (task.completed ? new Date() : null)
    });
    addTaskToContext(OmniFocus, task.contextSpec, omniFocusTask);
    OmniFocus.add(tags, { to: omniFocusTask.tags }); // This must be AFTER push() above, because side effects are awesome.
}

// TODO: This is utter hogwash.
class TaskCreator {
    createTask(task) {
        return createOmniFocusTask(task);
    }
}

/**
 * Filters the raw argv array to remove the first few elements that specify the runtime, runtime args, and the
 * currently executing script.
 *
 * I've got some really hacky guardrails around this for now.
 */
function getScriptArgs(all) {
    let firstScriptArgIndex = Math.max(0, all.findIndex((arg) => arg.endsWith('.js')));
    return all.slice(firstScriptArgIndex + 1);
}

function getCommandLineArgs() {
    ObjC.import('stdlib'); // TODO: consolidate this into a single import statement?
    const args = $.NSProcessInfo.processInfo.arguments;
    const unwrapped = [];
    for (let i = 0; i < args.count; i++) {
        const value = ObjC.unwrap(args.objectAtIndex(i));
        unwrapped.push(value);
    }
    return {
        argv: unwrapped,
        scriptArgs: getScriptArgs(unwrapped),
    };
}

const { scriptArgs } = getCommandLineArgs();
try {
    console.log('################################################################################');
    console.log(`creating new task: ${new Date()}`);
    console.log(`input: "${scriptArgs[0]}"`);
    var string = scriptArgs[0];
    var task = new TaskParser().parse(string);
    new TaskCreator().createTask(task);
    console.log('task created');
} catch (e) {
    console.log(`error creating task: ${e}`);
    console.log(e);
}
