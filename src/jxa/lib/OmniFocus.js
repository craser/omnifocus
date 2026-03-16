/**
 * Provides an abstraction layer between application logic & the OmniFocus application itself.
 * - All methods take & receive actual JS objects, not JXA object specifiers.
 */
export default class OmniFocus {
    constructor() {
        this.omnifocus = Application('OmniFocus');
    }


    // ************************************************************************************************************** //
    // Folders
    getFolder(parent, folderName) {
        try {
            if (!folderName) {
                console.log('no child folder name given - returning null');
                return null;
            }
            else if (!parent) {
                console.log('no parent - looking in default document')
                var folders = this.omnifocus.defaultDocument.flattenedFolders.whose({ name: { _beginsWith: folderName }});
                console.log(`folders found with name beginning with "${folderName}": ${folders.length}`);
                var folder = folders.length ? folders[0] : null;
                return folder;
            } else {
                console.log(`parent given - seeking ${parent.name()} → ${folderName}`);
                console.log(`parent: ${parent.name()}`);
                console.log(`parent.folders: ${parent.folders.length}`);
                //var folders = parent.folders.whose({ name: { _beginsWith: folderName }});
                var childFolder = null;
                for (let i = 0; i < parent.folders.length; i++) {
                    const folder = parent.folders[i];
                    console.log(`checking folder: ${folder.name()}`);
                    if (folder.name().startsWith(folderName)) {
                        console.log(`found folder: ${folder.name()}`);
                        childFolder = folder;
                        break;
                    }
                }
                console.log(`childFolder: ${childFolder}`);
                return childFolder;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    // ************************************************************************************************************** //
    // Projects

    getProjectInFolder(folder, prjName) {
        console.log('getting project in folder...');
        try {
            //var projects = folder.flattenedProjects.whose({ name: { _beginsWith: prjName } });
            for (let i = 0; i < folder.projects.length; i++) {
                const project = folder.projects[i];
                if (!project.name.get().startsWith(prjName)) {
                    continue;
                } else if (!/active/i.test(project.status.get())) {
                    continue;
                } else {
                    console.log(`found project: ${project.name.get()}`);
                    return project;
                }
            }
            console.log('no active project found in folder');
            return null;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

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
            console.log(e);
            return null;
        }
    }

    // ************************************************************************************************************** //
    // Tasks

    getChild(parent, taskName) {
        try {
            var tasks = parent.tasks.whose({ _and: [{ name: { _beginsWith: taskName } }, { completed: { _equals: "false" } }] });
            var task = tasks.length ? tasks[0] : null;
            return task;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Creates the specified task under the given parent.
     * @deprecated - use addTaskToProject or addTaskToFolder instead.
     *
     * @param parent - the parent OmniFocus Project or Task - if null, the task will be added to the inbox.
     * @param omniFocusTask - a JSON object holding the necessary info for creating a proper OmniFocus Task object.
     */
    addTask(parent, omniFocusTask) {
        console.log('adding task...')
        if (!parent) {
            console.log(`no parent given - adding to inbox`);
            this.addTaskToInbox(omniFocusTask);
        } else if (parent.projects) { // parent is a folder
            console.log(`"${parent.name()}" is a folder - adding to projects`);
            this.addTaskToFolder(parent, omniFocusProject);
        } else if (parent.tasks) { // parent is a project
            console.log(`parent (${parent.name()}) is a project - adding to tasks`)
            this.addTaskToProject(parent, omniFocusTask);
        } else {
            console.log('parent of unknown type - adding to inbox');
            this.addTaskToInbox(omniFocusTask);
        }
    }

    addTaskToInbox(task) {
        return this.omnifocus.defaultDocument.inboxTasks.push(task);
    }

    addTaskToProject(project, task) {
        return project.tasks.push(task);
    }

    addTaskToFolder(folder, task) {
        // convert to a project in the futile hope we can get away with this...
        const omniFocusProject = this.createProject(task); // hoping this works... probably not
        console.log(`created project: ${!!omniFocusProject}`);
        return folder.projects.push(omniFocusProject);
    }

    addTaskToParentTask(parent, task) {
        return parent.tasks.push(task);
    }

    createTask(task) {
        return this.omnifocus.Task(task);
    }

    createProject(task) {
        return this.omnifocus.Project(task);
    }

    // ************************************************************************************************************** //
    // Tags

    addTags(tags, task) {
        if (!task.tags) {
            console.log(`not adding tags to "${task.name}" - no tags list. Is 'task' a Project?`);
        } else {
            this.omnifocus.add(tags, { to: task.tags });
        }
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
