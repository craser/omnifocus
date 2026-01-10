#!/usr/bin/env osascript -l JavaScript
'use strict';

/**
 * Provides an abstraction layer between application logic & the OmniFocus application itself.
 * - All methods take & receive actual JS objects, not JXA object specifiers.
 */
class OmniFocus {
    constructor() {
        this.omnifocus = Application('OmniFocus');
    }

    // ************************************************************************************************************** //
    // Projects

    getActiveProject(prjName) {
        var projects = this.omnifocus.defaultDocument.flattenedProjects.whose({ name: { _beginsWith: prjName } });
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            if (/active/i.test(project.status.get())) {
                return project;
            }
        }
        throw new Error(`No such project: ${prjName}`);
    }

    // ************************************************************************************************************** //
    // Tasks

    getChild(parent, taskName) {
        var tasks = parent.tasks.whose({ _and: [{ name: { _beginsWith: taskName } }, { completed: { _equals: "false" } }] });
        if (tasks.length >= 1) {
            return tasks[0];
        } else {
            throw new Error(`No such task: ${taskName}`)
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

function createInboxTask() {
    const task = {
        name: `test task ${new Date()}`,
        //dueDate: task.dueDate,
        note: 'this is a test task',
    };
    let omniFocus = new OmniFocus();
    const omniFocusTask = omniFocus.createTask(task);
    omniFocus.addTask(null, omniFocusTask);
    console.log('task created');
}

function getProject() {
    const project = new OmniFocus().getActiveProject('bogus project');
    console.log(`found project?: ${!!project}`);
    console.log(`project name: ${project.name.get()} (${project.status.get()})`);
}


function createProjectTask() {
    const task = {
        name: `test task in project ${new Date()}`,
        //dueDate: task.dueDate,
        note: 'this is a test task',
    };

    const project = new OmniFocus().getActiveProject('bogus project');
    let omniFocus = new OmniFocus();
    let omniFocusTask = omniFocus.createTask(task);
    omniFocus.addTask(project, omniFocusTask);
    console.log('task created');
}

function getProjectSubtask() {
    let omniFocus = new OmniFocus();
    const project = omniFocus.getActiveProject('bogus project');
    const subtask = omniFocus.getChild(project, 'subtask');
    console.log(`subtask name: ${subtask.name.get()}`);
}

function createProjectSubSubTask() {
    const task = {
        name: `test sub-sub-task in project ${new Date()}`,
        //dueDate: task.dueDate,
        note: 'this is a test task',
    };

    let omniFocus = new OmniFocus();
    let project = omniFocus.getActiveProject('bogus');
    let subtask = omniFocus.getChild(project, 'subtask');
    let omniFocusTask = omniFocus.createTask(task);
    let subsubtask = omniFocus.addTask(subtask, omniFocusTask);
    console.log(`sub-sub-task created: ${!!subsubtask}`);
}

try {
    createInboxTask();
    getProject();
    createProjectTask();
    getProjectSubtask();
    createProjectSubSubTask();
} catch (e) {
    console.log(`error testing OmniFocus abstraction layer: ${e}`);
    console.log(e);
}
