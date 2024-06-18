const TaskParser = require('../js/TaskParser');
const jsonToTask = require('json-to-task');

/**
 * TODO:
 *   - mock Application
 *   = mock OmniFocus
 *   - mock every damn thing
 */

function MockTag(name) {
    this.name = name;
}

const Tag = function (opts) {
    this.name = opts.name;
};

class Storage {
    length = 0;
    #finder;

    constructor(finder) {
        this.#finder = finder;
    }

    push(x) {
        this[length++] = x;
    }

    whose(query) {
        return this.#finder(query);
    }
}

let Task = function (name) {
    this.name = name;
};
var MockOmniFocus = {
    Tag,
    Task,
    defaultDocument: {
        Tag,
        Task,
        tags: new Storage(({ name: { _beginsWith: tagName } }) => {
            // return something we can do: tags[0]() = tag
            // also return something we can: tags()[0] = tag
            let tag = new MockTag(tagName);
            let tags = (hack) => [tag]; // adding argument forces length to be 1
            tags[0] = () => tag;
            return tags;
        })
    }
};

beforeAll(() => {
    global.Application = function () {
        return MockOmniFocus;
    };
});

function runJsonToTask(input) {
    return jsonToTask([input]);
}

test('can run', () => {
    const task = new TaskParser().parse('test // .house :home');
    runJsonToTask(JSON.stringify(task));
})
