import OmniFocus from '~/src/jxa/lib/OmniFocus.js';


/**
 * Resolves a context specifier (a string[] of the names of Folders/Projects/Tasks) into a reference
 * to a single Folder/Project/Task.
 *
 * - first n elements are assumed to be Folders, until no child folder is found
 * - next element is assumed to be a Project (projects don't have child projects)
 * - everything after that is assumed to be tasks/subtasks
 */
export default class ContextResolver {

    resolve(contextSpec) {
        if (!contextSpec || !contextSpec.length) {
            return null;
        } else {
            const omniFocus = new OmniFocus();

            let folder = omniFocus.getFolder(null, contextSpec[0]);
            if (folder) {
                contextSpec.shift(); // discard the name of initial folder
                let childFolder = null;
                while (childFolder = omniFocus.getFolder(folder, contextSpec[0])) {
                    if (childFolder) {
                        folder = childFolder;
                        childFolder = null;
                        contextSpec.shift();
                    }
                }
            }

            let context = folder
                ? omniFocus.getProjectInFolder(folder, contextSpec.shift())
                : omniFocus.getActiveProject(contextSpec.shift());

            if (!context) {
                // FIXME: THESE ERRORS ARE USELESS because we're discarding the spec along the way
                throw new Error(`No project found: .${contextSpec.join('.')}`);
            }

            while (contextSpec.length) {
                context = omniFocus.getChild(context, contextSpec.shift());
            }
            if (!context) {
                // FIXME: THESE ERRORS ARE USELESS because we're discarding the spec along the way
                throw new Error(`No such context: .${contextSpec.join('.')}`);
            } else {
                return context;
            }
        }
    }
}
