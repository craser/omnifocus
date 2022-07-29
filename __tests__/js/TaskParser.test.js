const TaskParser = require('js/TaskParser');

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
        contextSpec: ['work', 'general'],
        completed: false,
        primaryTagName: null
    });
    expectDateTime(task.dueDate, 2021, 0, 1, 15, 0);
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
        contextSpec: ['work', 'general'],
        completed: false,
        primaryTagName: 'tagname1'
    });
    expectDateTime(task.dueDate, 2021, 0, 5, 15, 0);
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
        contextSpec: ['work', 'general'],
        completed: false,
        primaryTagName: 'waiting'
    });
    expectDateTime(task.dueDate, 2021, 0, 5, 15, 0);
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
        contextSpec: ['work', 'general'],
        completed: false,
        primaryTagName: null
    });
    expectDateTime(task.dueDate, 2021, 0, 1, 15, 0);
});

test("Exclamation point shouldn't break parsing.", () => {
    var input = "I want to be an Air Force Ranger! // .house :home";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.name).toBe('I want to be an Air Force Ranger!');
})

/**
 * TODO: Should mock out Date() to guarantee that time lines up. Danger if this runs in last few ms before
 * new minute.
 */
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
    expectDateTime(task.dueDate, 2021, 10, 12, 15, 0);
});

test('Should auto-set the due date on .work tasks to 3pm', () => {
    var input = "work task"; // .work project is currently, unfortunately, detected as an empty context
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDateTime(task.dueDate, 2021, 0, 1, 15, 0);
});

test('Should set due date on errands to 11am', () => {
    var input = "errand // .house :errands";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDateTime(task.dueDate, 2021, 0, 1, 11, 0);
});

test('Should set the time on :waiting tasks to 10pm', () => {
    var input = "waiting task // .house :home :waiting";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDateTime(task.dueDate, 2021, 0, 1, 22, 0);
});

test('Should set the time on .work tasks to 3pm', () => {
    var input = 'work task // .work';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDateTime(task.dueDate, 2021, 0, 1, 15, 0);
});

test('Should NOT set the time on .work tasks if time is specified', () => {
    var input = 'work task // .work 10am';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDateTime(task.dueDate, 2021, 0, 1, 10, 0);
});

test('Should set the time on .housekeeping tasks to 9pm', () => {
    var input = 'work task // .housekeeping';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDateTime(task.dueDate, 2021, 0, 1, 21, 0);
});

test('Should NOT set the time on .housekeeping tasks if time is specified', () => {
    var input = 'work task // .housekeeping 5am';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDateTime(task.dueDate, 2021, 0, 1, 5, 0);
});

test('Should NOT set the time on :waiting tasks if time is specified', () => {
    var input = 'package // .house :waiting';
    var parser = new TaskParser();
    var task = parser.parse(input);
    expectDateTime(task.dueDate, 2021, 0, 1, 22, 0);
});


test('If the context is a JIRA ticket, context should be ["work", "Jira Ticket"]', () => {
    var input = "jira task // .THX-1138";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('work');
    expect(task.contextSpec[1]).toEqual('THX-1138');
});

test('Should default context to .work.general', () => {
    var input = "task";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('work');
    expect(task.contextSpec[1]).toEqual('general');
});

test('Should add a default parent task of "general" to tasks in Work project', () => {
    var input = "task // .work";
    var parser = new TaskParser();
    var task = parser.parse(input);
    expect(task.contextSpec[0]).toEqual('work');
    expect(task.contextSpec[1]).toEqual('general');
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
