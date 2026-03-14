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
                console.log(`seeking child of ${folder.name()} → ${contextSpec[0]}`);
                console.log(`contextSpec: ${contextSpec.join(', ')}`);
                while (contextSpec.length && (childFolder = omniFocus.getFolder(folder, contextSpec[0]))) {
                    console.log(`checking childFolder...`);
                    console.log(`childFolder: ${childFolder.name()}`);
                    if (childFolder) {
                        console.log(`found child: ${childFolder.name()}`);
                        folder = childFolder;
                        childFolder = null;
                        contextSpec.shift();
                    } else {
                        console.log(`no child of folder ${folder.name()} found called ${contextSpec[0]}`);
                    }
                }
                console.log('done checking for child folders');
            }

            console.log(`assigning context... (folder found? ${!!folder})`);


            if (contextSpec.length == 0) {
                return folder;
            }

            let context = null;
            if (folder) {
                context = omniFocus.getProjectInFolder(folder, contextSpec.shift())
            } else {
                context = omniFocus.getActiveProject(contextSpec.shift());
            }

            console.log(`context: ${context.name()}`);
            if (!context) {
                // FIXME: THESE ERRORS ARE USELESS because we're discarding the spec along the way
                throw new Error(`No project found: .${contextSpec.join('.')}`);
            }

            console.log(`contextSpec: ${contextSpec.join(', ')}`);
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
