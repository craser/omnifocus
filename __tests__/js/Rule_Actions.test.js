'use strict'

const Rule = require('js/Rule');

function expectHasTag(task, tag) {
    expect(task.tagNames).toContain(tag);
}

function expectProject(task, project) {
    expect(task.contextSpec[0]).toEqual(project);
}

function applyActions(actions, task) {
    let rule = new Rule({
        condition: { value: true },
        actions: actions
    });
    rule.apply(task);
}

test('Add tag', () => {
    let actions = [{ tag: 'matched' }];
    let task = { tagNames: [] };
    applyActions(actions, task);
    expectHasTag(task, 'matched');
});

test('Add tag to existing tags', () => {
    let actions = [{ tag: 'matched' }];
    let task = { tagNames: ['existing'] };
    applyActions(actions, task);
    expectHasTag(task, 'matched');
    expectHasTag(task, 'existing');
});

test('Set project', () => {
    let actions = [{ project: 'project' }];
    let task = { contextSpec: [] };
    applyActions(actions, task);
    expectProject(task, 'project');
});

test
