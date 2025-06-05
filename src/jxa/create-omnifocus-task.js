import TaskParser from './lib/TaskParser';
import TaskCreator from './lib/TaskCreator';

class CreateOmniFocusTask {
    run(argv) {
        try {
            console.log('################################################################################');
            console.log(`creating new task: ${new Date()}`);
            console.log(`input: "${argv[0]}"`);
            var string = argv[0];
            var task = new TaskParser().parse(string);
            new TaskCreator().createTask(task);
            console.log('task created');
        } catch (e) {
            console.log(`error creating task: ${e}`);
            console.log(e);
        }
    }
}

if (require.main === module) {
    console.log('running');
    let creator = new CreateOmniFocusTask();
    creator.initEnv(process);
    creator.run(process.argv.slice(2));
} else {
    console.log('exporting');
    module.exports = CreateOmniFocusTask;
}
