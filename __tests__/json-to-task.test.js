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

var MockOmniFocus = {
    defaultDocument: {
        Tag: function (opts) {
            this.name = opts.name;
        },
        Task: function (name) {
            this.name = name;
        },
        tags: {
            whose: function () {
                return [new MockTag('mocktag')];
            }
        }

    }
};

beforeAll(() => {
    global.Application = function() {
        return MockOmniFocus;
    };
});

function runJsonToTask(input) {
    return jsonToTask([input]);
}

test('can run', () => {
    runJsonToTask('test // .house :home');
})
