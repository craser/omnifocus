import OmniFocus from '~/src/jxa/lib/OmniFocus.js';
import Context from '~/src/jxa/lib/Context.js';


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
        const omniFocus = new OmniFocus();
        if (!contextSpec || !contextSpec.length) {
            return Context.inbox(omniFocus);
        } else {
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
                return Context.folder(folder, omniFocus);
            }

            let context = null;
            if (folder) {
                context = omniFocus.getProjectInFolder(folder, contextSpec.shift())
            } else {
                context = omniFocus.getActiveProject(contextSpec.shift());
            }

            console.log(`context: ${context.name()}`);
            if (!context) {
                console.log('Unable to locate context. Returning inbox.');
                return Context.inbox(omniFocus);
            }

            console.log(`contextSpec: ${contextSpec.join(', ')}`);
            while (contextSpec.length) {
                context = omniFocus.getChild(context, contextSpec.shift());
            }
            if (!context) {
                console.log('Unable to locate context. Returning inbox');
                return Context.inbox(omniFocus);
            } else {
                return Context.project(context, omniFocus);
            }
        }
    }
}
