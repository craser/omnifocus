'use strict'

function autotagExpectedTask(task) {
    var taskName = task.name;
    if (/expect/i.test(taskName)) {
        task.tagNames.unshift('waiting'); // prepend to list
        task.primaryTagName = 'waiting'; // update primary tag to reflect that 'waiting' is at the head of the list
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
    this.rules = [autotagExpectedTask];
    this.applyRules = applyRules;
}

module.exports = RuleManger;
