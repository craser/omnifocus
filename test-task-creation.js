#!/usr/bin/env osascript -l JavaScript

// ABOUTME: Test script to verify we can create tasks in OmniFocus
// ABOUTME: Specifically tests creating a task under the "general" parent

const OmniFocus = Application('OmniFocus');

console.log("=== Testing Task Creation ===\n");

// Find Work project
const projects = OmniFocus.defaultDocument.flattenedProjects.whose({ name: { _beginsWith: "Work" } });
if (projects.length === 0) {
    console.log("ERROR: No Work project found!");
    throw new Error("No Work project found");
}

const workProject = projects[0]();
console.log(`Found Work project: "${workProject.name()}"`);

// Find general task
const generalTasks = workProject.tasks.whose({
    _and: [
        { name: { _beginsWith: "general" } },
        { completed: { _equals: "false" } }
    ]
});

if (generalTasks.length === 0) {
    console.log("ERROR: No general task found!");
    throw new Error("No general task found");
}

const generalTask = generalTasks[0]();
console.log(`Found general task: "${generalTask.name()}"`);
console.log(`Type of generalTask: ${typeof generalTask}`);
console.log(`Type of generalTask.tasks: ${typeof generalTask.tasks}`);
console.log(`Type of generalTask.tasks.push: ${typeof generalTask.tasks.push}`);

// Try to create a test task
console.log("\n=== Creating test task ===");
const testTask = OmniFocus.Task({
    name: "TEST TASK - " + new Date().toISOString(),
    completed: false,
    flagged: false
});

console.log(`Created task object: ${typeof testTask}`);
console.log(`Task name type: ${typeof testTask.name}`);
console.log(`Task name: ${testTask.name}`);

// Try to push it
console.log("\n=== Attempting to add task to general ===");
try {
    generalTask.tasks.push(testTask);
    console.log("SUCCESS: Task pushed without error");
} catch (e) {
    console.log(`ERROR: ${e}`);
    console.log(e.stack);
}

// Verify it was added
console.log("\n=== Verifying task was added ===");
const allTasks = generalTask.tasks();
console.log(`Tasks in general: ${allTasks.length}`);
allTasks.forEach((task, index) => {
    console.log(`  ${index + 1}. "${task.name()}"`);
});
