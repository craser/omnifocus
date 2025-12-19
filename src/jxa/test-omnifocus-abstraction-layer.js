import OmniFocus from './lib/OmniFocus';

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
    const subtask = omniFocus.getTask(project, 'subtask');
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
    let subtask = omniFocus.getTask(project, 'subtask')
    let omniFocusTask = omniFocus.createTask(task);
    let subsubtask = omniFocus.addTask(subtask, omniFocusTask);
    console.log(`sub-sub-task created: ${!!subsubtask}`);
}

try {
    createInboxTask();
    getProject();
    createProjectTask();
    getProjectSubtask()
    createProjectSubSubTask()
} catch (e) {
    console.log(`error testing OmniFocus abstraction layer: ${e}`);
    console.log(e);
}

