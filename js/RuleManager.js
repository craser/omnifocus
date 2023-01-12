'use strict'

const Rule = require('./Rule');

/**
 * First cut at this feature. Hard-coding to play & decide what I want.
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
function putJiraTicketsInWorkProject(task) {
    if (/\b\w\w\w\w?-\d\d\d\d?\b/.test((task.contextSpec)[0])) {
        task.contextSpec.unshift('work');
    } else if (/\b\w\w\w\w?-\d\d\d\d?\b/.test((task.name))) {
        var ticket = task.name.match(/\b\w\w\w\w?-\d\d\d\d?\b/)[0];
        task.contextSpec.unshift('work', ticket);
    }
    return task;
}
function defaultEmptyContextToWorkProject(task) {
    if (task.contextSpec.length == 0) {
        task.contextSpec = ['work', 'general'];
    }
    return task;
}

function defaultWorkTasksToGeneralParentTask(task) {
    if (/\bwork\b/i.test((task.contextSpec)[0]) && task.contextSpec.length == 1) {
        task.contextSpec.push('general');
    }
    return task;
}

function tagExpectedTasksAsWaiting(task) {
    var taskName = task.name;
    if (/expect/i.test(taskName)) {
        task.tagNames.unshift('waiting'); // prepend to list
        task.primaryTagName = 'waiting'; // update primary tag to reflect that 'waiting' is at the head of the list
    }
    return task;
}

function errandsDueAtEleven(task) {
    if (hasTag(task, 'errands') && task.dueDate.isDefaultTime) {
        task.dueDate.setHours(11);
        task.dueDate.isDefaultTime = false;
    }
    return task;
}

function workTasksDueAtThreePm(task) {
    if (/\bwork\b/i.test(task.contextSpec[0]) && task.dueDate.isDefaultTime) {
        task.dueDate.setHours(15);
        task.dueDate.isDefaultTime = false;
    }
    return task;
}

function housekeepingTasksDueAtNinePm(task) {
    if (/\bhouse(keeping)?\b/i.test(task.contextSpec[0]) && task.dueDate.isDefaultTime) {
        task.dueDate.setHours(11);
        task.dueDate.isDefaultTime = false;
    }
    return task;
}

function waitingTasksDueAtTenPm(task) {
    if (hasTag(task, 'waiting') && task.dueDate.isDefaultTime) {
        task.dueDate.setHours(22);
        task.dueDate.isDefaultTime = false;
    }
    return task;
}

function notDueTasksHaveNoDueDate(task) {
    if (hasTag(task, 'notdue')) {
        task.dueDate = null;
        removeTag(task, 'notdue');
    }
    return task;
}

function moviesHaveNoDueDate(task) {
    let isMovies = /movies/i.test(task.contextSpec[0]);
    let isReading = /reading/i.test(task.contextSpec[0]);
    if (isMovies || isReading) {
        if (task.dueDate && task.dueDate.isDefaultDate) {
            task.dueDate = null;
        }
    }
    return task;
}

function hasTag(task, tag) {
    return task.tagNames.find((t) => t.toLowerCase() == tag.toLowerCase());
}

function removeTag(task, tag) {
    task.tagNames = task.tagNames.filter(name => name != tag);
}

function applyRules(task) {
    this.softRules.forEach((rule) => {
        task = rule.apply(task);
    });
    this.rules.forEach((rule) => {
        task = rule(task);
    });
    return task;
}

function parseRules(rulesConfig) {
    return rulesConfig.map(rule => new Rule(rule));
}

function RuleManager(config) {
    this.softRules = parseRules(config.getRulesConfig());
    this.rules = [];
    let oldRules = [
        putJiraTicketsInWorkProject,
        defaultEmptyContextToWorkProject,
        defaultWorkTasksToGeneralParentTask,
        tagExpectedTasksAsWaiting,
        workTasksDueAtThreePm,
        waitingTasksDueAtTenPm,
        housekeepingTasksDueAtNinePm,
        errandsDueAtEleven,
        notDueTasksHaveNoDueDate,
        moviesHaveNoDueDate
    ];
    this.applyRules = applyRules;
}

module.exports = RuleManager;
