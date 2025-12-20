import OmniFocus from '~/src/jxa/lib/OmniFocus.js';


/**
 * Resolves a context specifier (a string[] of the names of Projects/Tasks) into a reference
 * to a single Project/Task.
 *
 * - first token MUST be a Project
 * - everything after that is assumed to be tasks/subtasks
 */
export default class ContextResolver {

    resolve(contextSpec) {
        if (!contextSpec || !contextSpec.length) {
            return null;
        } else {
            const omniFocus = new OmniFocus();
            let context = omniFocus.getActiveProject(contextSpec.shift());
            while (contextSpec.length) {
                context = omniFocus.getTask(context, contextSpec.shift());
            }
            if (!context) {
                throw new Error(`No such context: .${contextSpec.join('.')}`);
            } else {
                return context;
            }
        }
    }
}