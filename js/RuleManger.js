'use strict'

function autotagExpectedTask(task) {
    var taskName = task.name;
    if (/expect/i.test(taskName)) {
        task.tagNames.unshift('waiting'); // prepend to list
        task.primaryTagName = 'waiting'; // update primary tag to reflect that 'waiting' is at the head of the list
    }
    return task;
}

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

 * @param task
 */

function hasTag(task, tag) {
    return task.tagNames.find((t) => t.toLowerCase() == tag.toLowerCase());
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

function applyRules(task) {
    this.rules.forEach((rule) => {
        task = rule(task);
    });
    return task;
}

function RuleManger() {
    this.rules = [autotagExpectedTask, autoSetDueDate];
    this.applyRules = applyRules;
}

module.exports = RuleManger;
