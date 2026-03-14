#!/usr/bin/env osascript -l JavaScript

// ABOUTME: Check the exact location and parent of the "general" task
// ABOUTME: Helps understand where the task is in the hierarchy

const OmniFocus = Application('OmniFocus');

console.log("=== Checking 'general' task location ===\n");

// Find Work project
const projects = OmniFocus.defaultDocument.flattenedProjects.whose({ name: { _beginsWith: "Work" } });
if (projects.length === 0) {
    console.log("ERROR: No Work project found!");
    throw new Error("No Work project found");
}

const workProject = projects[0]();
console.log(`Found Work project: "${workProject.name()}"`);
console.log(`Work project ID: ${workProject.id()}`);

// Find general task
const generalTasks = workProject.tasks.whose({
    _and: [
        { name: { _beginsWith: "general" } },
        { completed: { _equals: "false" } }
    ]
});

if (generalTasks.length === 0) {
    console.log("\nERROR: No general task found!");
    throw new Error("No general task found");
}

const generalTask = generalTasks[0]();
console.log(`\nFound general task: "${generalTask.name()}"`);
console.log(`General task ID: ${generalTask.id()}`);

// Check if it has a parent task
try {
    const parentTask = generalTask.parentTask();
    if (parentTask) {
        console.log(`Parent task: "${parentTask.name()}"`);
        console.log(`Parent task ID: ${parentTask.id()}`);
    } else {
        console.log(`Parent task: null (this is a top-level task in the project)`);
    }
} catch (e) {
    console.log(`Error checking parent task: ${e}`);
}

// Check what project it thinks it belongs to
try {
    const containingProject = generalTask.containingProject();
    console.log(`Containing project: "${containingProject.name()}"`);
    console.log(`Containing project ID: ${containingProject.id()}`);
    console.log(`Same as Work project? ${containingProject.id() === workProject.id()}`);
} catch (e) {
    console.log(`Error checking containing project: ${e}`);
}

// Check if the task is in the inbox
try {
    const inInbox = generalTask.inInbox();
    console.log(`In inbox: ${inInbox}`);
} catch (e) {
    console.log(`Error checking inbox status: ${e}`);
}

// Show the hierarchy path
console.log("\n=== Hierarchy ===");
console.log(`Project: ${workProject.name()}`);
if (generalTask.parentTask()) {
    console.log(`  └─ Parent Task: ${generalTask.parentTask().name()}`);
    console.log(`      └─ general`);
} else {
    console.log(`  └─ general (top-level task in project)`);
}

console.log("\n=== Child tasks of general ===");
const childTasks = generalTask.tasks();
console.log(`Number of child tasks: ${childTasks.length}`);
if (childTasks.length > 0) {
    console.log("First 5 child tasks:");
    childTasks.slice(0, 5).forEach((task, index) => {
        console.log(`  ${index + 1}. "${task.name()}"`);
    });
}
