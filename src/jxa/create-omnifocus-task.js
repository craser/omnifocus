import TaskParser from './lib/TaskParser';
import TaskCreator from './lib/TaskCreator';
import { getCommandLineArgs } from './lib/system/command-line-args';
import { notify } from '~/src/jxa/lib/system/notify.js';

const { scriptArgs } = getCommandLineArgs();
try {
    console.log('################################################################################');
    console.log(`creating new task: ${new Date()}`);
    console.log(`input: "${scriptArgs[0]}"`);
    var string = scriptArgs[0];
    var task = new TaskParser().parse(string);
    const result = new TaskCreator().createTask(task);
    notify(result.toNotificationOptions());
    console.log(JSON.stringify(result, null, 2));
    console.log(result.toString());
} catch (e) {
    console.log(`error creating task: ${e}`);
    console.log(e);
}

