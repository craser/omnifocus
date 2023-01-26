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
        if (task.primaryTagName == null) {
            task.primaryTagName = action.tag; // update primary tag to reflect that the new tag is at the head of the list
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
        task.dueDate = dateParser.overrideDate(task.dueDate, action.due);
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
            return !task.dueDate.isDefaultDate == !condition['default-date'];
        } else if ('default-time' in condition) {
            return !task.dueDate.isDefaultTime == !condition['default-time'];
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

function apply(task) {
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

function Rule(config) {
    this.config = config;
    this.apply = apply;
}

module.exports = Rule;
