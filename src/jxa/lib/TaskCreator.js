import OmniFocus from '~/src/jxa/lib/OmniFocus.js';

function parseTags(omniFocus, tagNames) {
    var tags = [];
    tagNames.forEach(function (tagName) {
        const tag = omniFocus.getTag(tagName) || omniFocus.createTag(tagName);
        tags.push(tag);
    });
    return tags;
}

function ensureContext(omniFocus, parent, context, task) {
    if (!context.length) {
        omniFocus.addTask(parent, task);
    } else {
        var child = omniFocus.getTask(parent, context[0]);
        if (!child) {
            child = omniFocus.createTask({ name: context[0] });
            omniFocus.addTask(parent, child);
            ensureContext(omniFocus, child, context.slice(1), task);
        } else {
            ensureContext(omniFocus, child, context.slice(1), task);
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
 *   - ''           ➤ []
 *   - '.prj'       ➤ ['prj']
 *   - '.prj.task'  ➤ ['prj', 'task']
 *   - '.task'      ➤ [DEFAULT_PROJECT, 'task']
 *
 * @param omniFocus
 * @param contextSpec
 * @return {*[]}
 */
function parseContext(omniFocus, contextSpec) {
    console.log(`contextSpec: [${contextSpec.map(x => `'${x}'`).join(', ')}]`);
    if (!contextSpec.length) {
        return [];
    } else {
        var context = [];
        var project = omniFocus.getActiveProject(contextSpec[0]);
        if (project) {
            contextSpec.shift(); // discard the used name
            context.push(project.name()); // use the actual name
        }
        context = context.concat(contextSpec);
        console.log(`context: [${context.map(x => `'${x}'`).join(', ')}]`);
        return context;
    }
}

function addTaskToContext(omniFocus, contextSpec, task) {
    var context = parseContext(omniFocus, contextSpec);
    if (!context.length) {
        omniFocus.addTask(null, task);
    } else {
        var project = omniFocus.getActiveProject(context[0]);
        if (!project) {
            throw new Error(`Project "${context[0]}" not found.`);
        }
        ensureContext(omniFocus, project, context.slice(1), task);
    }
}

// TODO: This is utter hogwash.
export default class TaskCreator {
    createTask(task) {
        var omniFocus = new OmniFocus();
        var primaryTag = task.primaryTagName && omniFocus.getTag(task.primaryTagName);
        var tags = parseTags(omniFocus, task.tagNames);
        var omniFocusTask = omniFocus.createTask({
            name: task.name,
            primaryTag: task.completed ? null : primaryTag, // OmniFocus chokes on completed tasks with a primary tag.
            dueDate: task.dueDate,
            note: task.note,
            completed: task.completed,
            flagged: task.flagged,
            completionDate: (task.completed ? new Date() : null)
        });
        addTaskToContext(omniFocus, task.contextSpec, omniFocusTask);
        omniFocus.addTags(tags, omniFocusTask);
        return omniFocusTask;
    }
}
