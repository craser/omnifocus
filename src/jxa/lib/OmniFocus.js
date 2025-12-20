/**
 * Provides an abstraction layer between application logic & the OmniFocus application itself.
 * - All methods take & receive actual JS objects, not JXA object specifiers.
 */
export default class OmniFocus {
    constructor() {
        this.omnifocus = Application('OmniFocus');
    }

    // ************************************************************************************************************** //
    // Projects

    getActiveProject(prjName) {
        try {
            var projects = this.omnifocus.defaultDocument.flattenedProjects.whose({ name: { _beginsWith: prjName } });
            for (let i = 0; i < projects.length; i++) {
                const project = projects[i];
                if (/active/i.test(project.status.get())) {
                    return project;
                }
            }
            return null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    // ************************************************************************************************************** //
    // Tasks

    getTask(parent, taskName) {
        try {
            var tasks = parent.tasks.whose({ _and: [{ name: { _beginsWith: taskName } }, { completed: { _equals: "false" } }] });
            var task = tasks.length ? tasks[0] : null;
            return task;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    /**
     * Creates the specified task under the given parent.
     * @param parent - the parent OmniFocus Project or Task - if null, the task will be added to the inbox.
     * @param omniFocusTask - a JSON object holding the necessary info for creating a proper OmniFocus Task object.
     */
    addTask(parent, omniFocusTask) {
        if (!parent) {
            this.omnifocus.defaultDocument.inboxTasks.push(omniFocusTask);
        } else {
            parent.tasks.push(omniFocusTask);
        }
    }

    createTask(task) {
        return this.omnifocus.Task(task);
    }

    // ************************************************************************************************************** //
    // Tags

    addTags(tags, task) {
        this.omnifocus.add(tags, { to: task.tags });
    }

    getTag(tagName) {
        try {
            var tags = this.omnifocus.defaultDocument.tags.whose({ name: { _beginsWith: tagName } });
            var tag = tags[0]();
            return tag;
        } catch (e) {
            return null;
        }
    }

    createTag(tagName) {
        var tag = this.omnifocus.Tag({
            name: tagName
        });
        this.omnifocus.defaultDocument.tags.push(tag);
        return tag;
    }
}