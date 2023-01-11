const Rule = require('js/Rule');

function expectTags(task, tags) {
    expect(task.tagNames).toEqual(tags);
}

function expectMatches(condition, task) {
    let rule = new Rule({
        condition: condition,
        actions: [{ tag: 'matched' }]
    });
    rule.apply(task);
    expectTags(task, ['matched']);
}

function expectNotMatches(condition, task) {
    let rule = new Rule({
        condition: condition,
        actions: [{ tag: 'matched' }]
    });
    rule.apply(task);
    expectTags(task, []);
}

test('Condition {value: true}', () => {
    expectMatches({ value: true }, { tagNames: [] });
});

test('Condition {value: false}', () => {
    expectNotMatches({ value: false }, { tagNames: [] });
});

test('Condition {or: [{value: true}, {value: false}]}', () => {
    expectMatches({or: [{value: true}, {value: false}]}, { tagNames: [] });
});

test('Condition {or: [{value: false}, {value: false}]}', () => {
    expectNotMatches({or: [{value: false}, {value: false}]}, { tagNames: [] });
});

test('Condition {and: [{value: true}, {value: true}]}', () => {
    expectMatches({and: [{value: true}, {value: true}]}, { tagNames: [] });
});

test('Condition {and: [{value: true}, {value: false}]}', () => {
    expectNotMatches({and: [{value: true}, {value: false}]}, { tagNames: [] });
});

test('Condition {and: [{value: false}, {value: false}]}', () => {
    expectNotMatches({and: [{value: false}, {value: false}]}, { tagNames: [] });
});

test('Condition matches {matches: "/foo/"}', () => {
    expectMatches({name: '/foo/'}, { name: 'foo', tagNames: [] });
});

test('Condition does not match {matches: "/foo/"}', () => {
    expectNotMatches({name: '/foo/'}, { name: 'bar', tagNames: [] });
});

test('Matches no project', () => {
    expectMatches({"no-project": true}, { contextSpec: [], tagNames: [] });
});

test('Does not match project', () => {
    expectNotMatches({"no-project": true}, { contextSpec: ['project'], tagNames: [] });
});

test('Matches project', () => {
    expectMatches({"no-project": false}, { contextSpec: ['project'], tagNames: [] });
});

test('Matches project', () => {
    expectNotMatches({"no-project": false}, { contextSpec: [], tagNames: [] });
});

test('Matches no-parent', () => {
    expectMatches({"no-parent": true}, { contextSpec: ['work'], tagNames: [] });
});

test('Does not match no-parent', () => {
    expectNotMatches({ "no-parent": true }, { contextSpec: ['project', 'parent'], tagNames: [] });
});

test('Matches work' , () => {
    expectMatches({
        "and": [
            {
                "project": "/\\bwork\\b/"
            },
            {
                "defaultTime": true
            }
        ]
    }, { dueDate: new Date(), contextSpec: ['work'], tagNames: [] });
});







