'use strict'

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
 *     - default project: work
 *     - default parent task: general
 *     - default due date: today
 *     - default due time: 7pm
 *     - :errands ➤ due at 11am
 *     - .work ➤ due at 3pm
 *     - :housekeeping ➤ due at 9pm
 *     - :waiting ➤ due at 10pm
 *
 * TODO: (follow-up)
 *     - remove default date & time logic from DateParser
 *     - remove implementation of above rules from RuleManager

 * @return {{}}
 */
function putJiraTicketsInWorkProject(task) {
    if (isJiraTicketContext(task.contextSpec)) {
        task.contextSpec.unshift('work');
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

function autoSetDueDate(task) {
    // FIXME: This is presumed to be WORK, since we "know" that json-to-task.js will
    // default this to the .work project.
    if (!task.contextSpec || task.contextSpec.length == 0) {
        task.dueDate.setHours(15);
    } else if (hasTag(task, 'errands')) {
        task.dueDate.setHours(11);
    } else if (hasTag(task, 'housekeeping')) {
        task.dueDate.setHours(19);
    } else if (hasTag(task, 'waiting')) {
        task.dueDate.setHours(22);
    }
    return task;
}

function isJiraTicketContext(contextSpec) {
    return /\b\w\w\w\w?-\d\d\d\d?\b/.test(contextSpec[0]);
}

function hasTag(task, tag) {
    return task.tagNames.find((t) => t.toLowerCase() == tag.toLowerCase());
}

function applyRules(task) {
    this.rules.forEach((rule) => {
        task = rule(task);
    });
    return task;
}

function RuleManager() {
    this.rules = [
        putJiraTicketsInWorkProject,
        defaultEmptyContextToWorkProject,
        defaultWorkTasksToGeneralParentTask,
        tagExpectedTasksAsWaiting,
        autoSetDueDate
    ];
    this.applyRules = applyRules;
}

module.exports = RuleManager;
