import OmniFocus from '~/src/jxa/lib/OmniFocus.js';
import ContextResolver from '~/src/jxa/lib/ContextResolver.js';

function parseTags(omniFocus, tagNames) {
    var tags = [];
    tagNames.forEach(function (tagName) {
        const tag = omniFocus.getTag(tagName) || omniFocus.createTag(tagName);
        tags.push(tag);
    });
    return tags;
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
        const context = new ContextResolver().resolve(task.contextSpec);
        omniFocus.addTask(context, omniFocusTask);
        omniFocus.addTags(tags, omniFocusTask);
        return omniFocusTask;
    }
}
