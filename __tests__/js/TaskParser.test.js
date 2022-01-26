const TaskParser = require('js/TaskParser');

function expectDateTime(obj, year, month, date, hours, minutes, seconds) {
    expect(obj.getFullYear()).toBe(year);
    expect(obj.getMonth()).toBe(month);
    expect(obj.getDate()).toBe(date);
    expect(obj.getHours()).toBe(hours);
    expect(obj.getMinutes()).toBe(minutes);
    expect(obj.getSeconds()).toBe(seconds || 0);
}

function expectTask(task, expected) {
    expect(task.name).toBe(expected.name);
    expect(task.tagNames).toEqual(expected.tagNames);
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
    expectDateTime(task.dueDate, 2021, 0, 1, 19, 0);
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

test('Sample 4', () => {
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
    expectDateTime(task.dueDate, 2021, 0, 5, 19, 0);
})

test('Sample 8', () => {
    var input = 'Expect task name // :tagname1 tuesday';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectTask(task, {
        name: 'Expect task name',
        tagNames: ['waiting', 'tagname1'],
        note: '',
        flagged: false,
        contextSpec: [],
        completed: false,
        primaryTagName: 'waiting'
    });
    expectDateTime(task.dueDate, 2021, 0, 5, 19, 0);
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
    expectDateTime(task.dueDate, 2021, 0, 1, 19, 0);
})
