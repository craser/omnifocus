#!/usr/bin/env osascript -l JavaScript

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

function parseDate(string) {
    if (!string) {
        return null;
    } else {
        var date = new Date(string);
        return date;
    }
}

function parseTask(json) {
    var task = JSON.parse(json);
    task.dueDate = parseDate(task.dueDate);
    task.completionDate = parseDate(task.completionDate);
    return task;
}

function run(argv) {
    try {
        console.log('################################################################################');
        console.log(`creating new task: ${new Date()}`);
        console.log(`input: "${argv[0]}"`);
        var json = argv[0];
        var task = parseTask(json);
        createOmniFocusTask(task);
        console.log('task created');
    } catch (e) {
        console.log(`error creating task: ${e}`);
        console.log(e);
    }
}

if (typeof module != 'undefined') {
    module.exports = run;
}
