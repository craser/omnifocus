'use strict'

const DateParser = require('./DateParser');
const dateParser = new DateParser();

function getRegex(descriptor) {
    try { // yeah, this is a hack
        return eval(descriptor);
    } catch (e) {
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
        task.primaryTagName = action.tag; // update primary tag to reflect that the new tag is at the head of the list
    } else if ('project' in action) {
        let project = evaluate(action.project, task);
        task.contextSpec.unshift(project);
        task.contextSpec = uniq(task.contextSpec);
    } else if ('parent' in action) {
        let parent = evaluate(action.parent, task);
        task.contextSpec.push(parent);
        task.contextSpec = uniq(task.contextSpec);
    } else if ('due' in action) {
        task.dueDate = dateParser.parseDueDate(action.due);
    }
    return task;
}

function test(condition, task) {
    if ('value' in condition) { // mostly for testing
        return condition.value;
    } else if ('or' in condition) {
        return condition.or.reduce((a, condition) => a || test(condition, task), false);
    } else if ('and' in condition) {
        return condition.and.reduce((a, condition) => a && test(condition, task), true);
    } else if ('name' in condition) {
        return parsePattern(condition.name)(task.name);
    } else if ('project' in condition) {
        return parsePattern(condition.project)(task.contextSpec[0]);
    } else if ('tag' in condition) {
        return hasTag(task, condition.tag);
    } else if ('defaultTime' in condition) {
        return task.dueDate.isDefaultTime == condition.defaultTime;
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

function hasTag(task, tag) {
    return task.tagNames.find((t) => t.toLowerCase() == tag.toLowerCase());
}

function apply(task) {
    if (test(this.config.condition, task)) {
        this.config.actions.forEach(action => {
            task = act(action, task);
        });
    }
    return task;
}

function Rule(config) {
    this.config = config;
    this.apply = apply;
}

module.exports = Rule;
