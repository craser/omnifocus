export default class Context {
    type;
    ofContextObject;
    omnifocus;

    static inbox(omnifocus) {
        return new Context(Context.TYPE_INBOX, null, omnifocus);
    }

    static folder(folder, omnifocus) {
        return new Context(Context.TYPE_FOLDER, folder, omnifocus);
    }

    static project(parent, omnifocus) {
        return new Context(Context.TYPE_PROJECT, parent, omnifocus);
    }

    static task(parent, omnifocus) {
        return new Context(Context.TYPE_TASK, parent, omnifocus);
    }

    constructor(type, ofContextObject, omnifocus) {
        this.type = type;
        this.ofContextObject = ofContextObject;
        this.omnifocus = omnifocus;
    }

    addTask(omniFocusTask) {
        console.log(`Adding task to ${this.type} context`);
        switch (this.type) {
            case Context.TYPE_FOLDER:
                this.omnifocus.addTaskToFolder(this.ofContextObject, omniFocusTask);
                break;
            case Context.TYPE_PROJECT:
                this.omnifocus.addTaskToProject(this.ofContextObject, omniFocusTask);
                break;
            case Context.TYPE_TASK:
                this.omnifocus.addTaskToParentTask(this.ofContextObject, omniFocusTask);
                break;
            case Context.TYPE_INBOX:
                this.omnifocus.addTaskToInbox(omniFocusTask);
                break;
            default:
                console.log(`Unrecognized context type: ${this.type}. Adding to inbox.`);
                this.omnifocus.addTaskToInbox(omniFocusTask);
                break;
        }

    }
}

Context.TYPE_INBOX = 'inbox';
Context.TYPE_FOLDER = 'folder';
Context.TYPE_PROJECT = 'project';
Context.TYPE_TASK = 'task';
