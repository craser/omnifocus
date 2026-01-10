import ContextResolver from '~/src/jxa/lib/ContextResolver.js';

export default class TaskCreationResult {
    success;
    title;
    details;
    task;
    ofTask;

    static success(task, ofTask) {
        return new TaskCreationResult({
            success: true,
            title: `Created: ${task.name}`,
            details: `Created task in ${TaskCreationResult.renderContext(task)}`,
            task: task,
            ofTask: ofTask
        });
    }

    static failure(task, error) {
        return new TaskCreationResult({
            success: false,
            title: `Error creating task ${task.name}`,
            details: error.message,
            task: task,
            ofTask: null
        })
    }

    static renderContext(task) {
        const canonicalSpec = new ContextResolver().getCanonicalSpec(task.contextSpec);
        const rendered = canonicalSpec.length
            ? canonicalSpec.join(' → ')
            : 'Inbox';
        return rendered;
    }

    constructor({ success, title, details, task, ofTask }) {
        Object.assign(this, { success, title, details, task, ofTask });
    }

    toNotificationOptions() {
        if (this.success) {
            return {
                title: this.title,
                message: this.details
            };
        } else {
            return {
                title: "Task creation failed",
                message: this.details
            }
        }
    }

    toString() {
        if (this.success) {
            return `SUCCESS: Created task "${this.title}": "${this.details}"`;
        } else {
            return `Failed to create task. ${JSON.stringify(this)}`
        }
    }

}
