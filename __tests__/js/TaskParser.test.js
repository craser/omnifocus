const TaskParser = require('src/jxa/lib/TaskParser');
jest.mock('src/jxa/lib/RuleManager', () => {
    return class RuleManager {
        constructor() {}
        applyRules(task) {
            return task;
        }
    }
});

function expectDate(obj, year, month, date) {
    expect(obj.getFullYear()).toBe(year);
    expect(obj.getMonth()).toBe(month);
    expect(obj.getDate()).toBe(date);
}

function expectDateTime(obj, year, month, date, hours, minutes, seconds) {
    expectDate(obj, year, month, date);
    expect(obj.getHours()).toBe(hours);
    expect(obj.getMinutes()).toBe(minutes);
    expect(obj.getSeconds()).toBe(seconds || 0);
}

function expectTask(task, expected) {
    expect(task.name).toBe(expected.name);
    expect(task.tagNames.sort()).toEqual(expected.tagNames.sort());
    expect(task.note).toBe(expected.note);
    expect(task.flagged).toBe(expected.flagged);
    expect(task.contextSpec).toEqual(expected.contextSpec);
    expect(task.completed).toBe(expected.completed);
    expect(task.primaryTagName).toBe(expected.primaryTagName);
}

test('Reasonable defaults', () => {
    var parser = new TaskParser();
    var task = parser.parse('task');
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: null
    });
    expect(task.dueDate).toBeFalsy();
});

test('Support "today" as due date', () => {
    var parser = new TaskParser();
    var task = parser.parse('task // today');
    expectTask(task, {
        name: 'task',
        tagNames: [],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: null
    });
    expectDate(task.dueDate, 2021, 0, 1);
});

test('Support "tomorrow" and "tmw" as due date', () => {
    var parser = new TaskParser();
    ['task // tomorrow', 'task // tmw'].forEach(input => {
        var task = parser.parse(input);
        expectTask(task, {
            name: 'task',
            tagNames: [],
            note: '',
            flagged: false,
            contextSpec: [],
            completed: false,
            primaryTagName: null
        });
        expectDate(task.dueDate, 2021, 0, 2);
    });
});

test('Sample 1', () => {
    var input = 'task name // :tagname1, :tagname2 .project 5/11/2023 11:22pm';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'task name',
        tagNames: ['tagname1', 'tagname2'],
        note: '',
        flagged: false,
        contextSpec: ['project'],
        completed: false,
        primaryTagName: 'tagname1'
    });
    expectDateTime(task.dueDate, 2023, 4, 11, 23, 22);
})

test('Sample 2', () => {
    var input = 'task name // :tagname1, :tagname2 .project.task 5/11/2023 11:22pm';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'task name',
        tagNames: ['tagname1', 'tagname2'],
        note: '',
        flagged: false,
        contextSpec: ['project', 'task'],
        completed: false,
        primaryTagName: 'tagname1'
    });
    expectDateTime(task.dueDate, 2023, 4, 11, 23, 22);
})

test('Sample 3', () => {
    var input = 'task name // :tagname1, :tagname2 .project.task 5/11/2023 11:22pm /** https://foo.bar.zaz';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'task name',
        tagNames: ['tagname1', 'tagname2'],
        note: 'https://foo.bar.zaz',
        flagged: false,
        contextSpec: ['project', 'task'],
        completed: false,
        primaryTagName: 'tagname1'
    });
    expectDateTime(task.dueDate, 2023, 4, 11, 23, 22);
})

test('Add completed flag & date for tasks marked as done', () => {
    var input = 'task name // :tagname1, :tagname2 .project.task 5/11/2023 11:22pm flag done';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'task name',
        tagNames: ['tagname1', 'tagname2'],
        note: '',
        flagged: true,
        contextSpec: ['project', 'task'],
        completed: true,
        primaryTagName: 'tagname1'
    });
    expectDateTime(task.dueDate, 2023, 4, 11, 23, 22);
    expectDateTime(task.completionDate, 2021, 0, 1, 0, 0, 0);
})

test('Sample 5', () => {
    var input = 'task name // :tagname1, :tagname2 .project.task 5/11 11am';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'task name',
        tagNames: ['tagname1', 'tagname2'],
        note: '',
        flagged: false,
        contextSpec: ['project', 'task'],
        completed: false,
        primaryTagName: 'tagname1'
    });
    expectDateTime(task.dueDate, 2021, 4, 11, 11, 0);
})

test('Sample 6', () => {
    var input = 'task name // :tagname1, :tagname2 .project.task tuesday 11am';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'task name',
        tagNames: ['tagname1', 'tagname2'],
        note: '',
        flagged: false,
        contextSpec: ['project', 'task'],
        completed: false,
        primaryTagName: 'tagname1'
    });
    expectDateTime(task.dueDate, 2021, 0, 5, 11, 0);
})

test('Sample 7', () => {
    var input = 'task name // :tagname1 tuesday';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'task name',
        tagNames: ['tagname1'],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: 'tagname1'
    });
    expectDate(task.dueDate, 2021, 0, 5);
})

test('Sample 8', () => {
    var input = 'Expect task name // :tagname1 tuesday';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'Expect task name',
        tagNames: ['tagname1'],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: 'tagname1'
    });
    expectDate(task.dueDate, 2021, 0, 5);
})

test('Phone number support in task & notes', () => {
    var input = "Don't lose that number 8008675309 // /** (805) 123-1234";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'Don\'t lose that number 8008675309',
        tagNames: [],
        note: '(805) 123-1234\np: (800) 867-5309\np: (805) 123-1234',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: null
    });
    expect(task.dueDate).toBeNull();
});

test('Should ignore number strings that are NOT phone numbers.', () => {
    var input = "No phone numbers here // /** https://example.com/?q=2.203236369.1088963720.1661209194-471399446.1641846271";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'No phone numbers here',
        tagNames: [],
        note: 'https://example.com/?q=2.203236369.1088963720.1661209194-471399446.1641846271',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: null
    });
    expect(task.dueDate).toBeNull();
});

test('Should correctly populate completion date & done status, even with tags', () => {
    var input = 'test task // .house :home done';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'test task',
        tagNames: ['home'],
        note: '',
        flagged: false,
        contextSpec: ['house'],
        completed: true,
        primaryTagName: 'home'
    });
});

test("Exclamation point shouldn't break parsing.", () => {
    var input = "I want to be an Air Force Ranger! // .house :home";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.name).toBe('I want to be an Air Force Ranger!');
})

test("Support 'now' as due date", () => {
    var input = "Poop // .house :home now";
    var parser = new TaskParser();
    var task = parser.parse(input);
    var now = new Date();
    expect(task.dueDate.getHours()).toBe(now.getHours());
    expect(task.dueDate.getMinutes()).toBe(now.getMinutes());
});

test('Should ignore dates in description, honor dates in metadata', () => {
    var input = "Ignore this date 9/10 // 11/12";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDate(task.dueDate, 2021, 10, 12);
});

test('Should respect relative days, result in due date of 8/5/2028', () => {
    var input = "task // 8/3/2028 +2days";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDate(task.dueDate, 2028, 7, 5);
    expect(task.dueDate.isDefaultDate).toBeFalsy();
});

test('Should respect relative days, result in due date of 7/31/2028', () => {
    var input = "task // 8/3/2028 -4days";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDate(task.dueDate, 2028, 6, 30);
    expect(task.dueDate.isDefaultDate).toBeFalsy();
});

test('Should respect relative weeks, result in due date of 8/17/2028', () => {
    var input = "task // 8/3/2028 +2weeks";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDate(task.dueDate, 2028, 7, 17);
    expect(task.dueDate.isDefaultDate).toBeFalsy();
});

test('Should respect relative weeks, result in due date of 7/31/2028', () => {
    var input = "task // 8/3/2028 -1week";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDate(task.dueDate, 2028, 6, 27);
    expect(task.dueDate.isDefaultDate).toBeFalsy();
});

test('Tolerate missing space after meta delimiter', () => {
    var input = "task //:home .house";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('house');
});

test('Task with "next" as due date should get now as due date, and be flagged', () => {
    var input = "task // next";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDateTime(task.dueDate, 2021, 0, 1, 0, 0);
    expect(task.flagged).toBeTruthy();
});

test('Support dashes in tag names', () => {
    var input = "task // :tag-name";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.tagNames[0]).toEqual('tag-name');
});

test('Support single quotes around whole context spec', () => {
    var input = "task // '.whole.context spec'";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('whole');
    expect(task.contextSpec[1]).toEqual('context spec');
});

test('Support double quotes around whole context spec', () => {
    var input = "task // \".whole.context spec\"";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('whole');
    expect(task.contextSpec[1]).toEqual('context spec');
});

test('Support single quotes around spec segments', () => {
    var input = "task // .whole.'context spec'";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('whole');
    expect(task.contextSpec[1]).toEqual('context spec');
});

test('Support double quotes around spec segments', () => {
    var input = "task // .whole.\"context spec\"";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('whole');
    expect(task.contextSpec[1]).toEqual('context spec');
});

test('Tollerates other single-quoted strings left lying around before the spec', () => {
    var input = "task // 'ignore this' .whole.\"context spec\"";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('whole');
    expect(task.contextSpec[1]).toEqual('context spec');
});

test('Tollerates other single-quoted strings left lying around after the spec', () => {
    var input = "task // .whole.\"context spec\" 'ignore this'";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('whole');
    expect(task.contextSpec[1]).toEqual('context spec');
});

test('Tollerates other double-quoted strings left lying around before the spec', () => {
    var input = "task // \"ignore this\" .whole.\"context spec\"";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('whole');
    expect(task.contextSpec[1]).toEqual('context spec');
});

test('Tollerates other double-quoted strings left lying around after the spec', () => {
    var input = "task // .whole.\"context spec\" \"ignore this\"";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('whole');
    expect(task.contextSpec[1]).toEqual('context spec');
});
