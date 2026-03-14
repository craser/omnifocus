#!/usr/bin/env osascript -l JavaScript

// ABOUTME: Diagnostic script to check OmniFocus project and task state
// ABOUTME: Helps debug task creation issues

const OmniFocus = Application('OmniFocus');

console.log("=== OmniFocus Diagnostic ===\n");

// Find Work project
const projects = OmniFocus.defaultDocument.flattenedProjects.whose({ name: { _beginsWith: "Work" } });
console.log(`Projects matching "Work": ${projects.length}`);

if (projects.length > 0) {
    const workProject = projects[0]();
    console.log(`Found project: "${workProject.name()}"`);

    // Get all tasks in the Work project
    const allTasks = workProject.tasks();
    console.log(`\nTotal tasks in Work project: ${allTasks.length}`);

    allTasks.forEach((task, index) => {
        console.log(`  ${index + 1}. "${task.name()}" - completed: ${task.completed()}`);
    });

    // Specifically look for "general" task
    console.log("\n=== Looking for 'general' task ===");
    const generalTasks = workProject.tasks.whose({
        _and: [
            { name: { _beginsWith: "general" } },
            { completed: { _equals: false } }
        ]
    });
    console.log(`Tasks matching 'general' (completed=false): ${generalTasks.length}`);

    if (generalTasks.length > 0) {
        const generalTask = generalTasks[0]();
        console.log(`Found: "${generalTask.name()}" - Type: ${typeof generalTask}`);
        console.log(`Task has 'name' property: ${typeof generalTask.name}`);
        console.log(`Task has 'tasks' property: ${typeof generalTask.tasks}`);
    } else {
        console.log("No 'general' task found");
    }

    // Also check with string "false"
    console.log("\n=== Looking for 'general' task (completed='false' as string) ===");
    const generalTasksString = workProject.tasks.whose({
        _and: [
            { name: { _beginsWith: "general" } },
            { completed: { _equals: "false" } }
        ]
    });
    console.log(`Tasks matching 'general' (completed="false"): ${generalTasksString.length}`);

} else {
    console.log("No Work project found!");
}
