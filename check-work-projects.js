#!/usr/bin/env osascript -l JavaScript

// ABOUTME: Check all Work projects and their status
// ABOUTME: Helps identify which Work project is active

const OmniFocus = Application('OmniFocus');

console.log("=== All Work Projects ===\n");

const projects = OmniFocus.defaultDocument.flattenedProjects.whose({ name: { _beginsWith: "Work" } });
console.log(`Total projects matching "Work": ${projects.length}\n`);

for (let i = 0; i < projects.length; i++) {
    const project = projects[i]();
    console.log(`Project ${i + 1}:`);
    console.log(`  Name: "${project.name()}"`);
    console.log(`  ID: ${project.id()}`);
    console.log(`  Status: ${project.status()}`);
    console.log(`  Completed: ${project.completed()}`);

    // Check number of tasks
    const tasks = project.tasks();
    console.log(`  Total tasks: ${tasks.length}`);

    // Check for "general" task
    const generalTasks = project.tasks.whose({
        _and: [
            { name: { _beginsWith: "general" } },
            { completed: { _equals: "false" } }
        ]
    });
    console.log(`  Has "general" task: ${generalTasks.length > 0}`);
    console.log();
}
