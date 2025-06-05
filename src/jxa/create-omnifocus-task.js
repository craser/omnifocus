import TaskParser from './lib/TaskParser';
import TaskCreator from './lib/TaskCreator';
import { getCommandLineArgs } from './lib/system/command-line-args';

const { scriptArgs } = getCommandLineArgs();
try {
    console.log('################################################################################');
    console.log(`creating new task: ${new Date()}`);
    console.log(`input: "${scriptArgs[0]}"`);
    var string = scriptArgs[0];
    var task = new TaskParser().parse(string);
    new TaskCreator().createTask(task);
    console.log('task created');
} catch (e) {
    console.log(`error creating task: ${e}`);
    console.log(e);
}

