import OmniFocus from '~/src/jxa/lib/OmniFocus.js';


/**
 * Resolves a context specifier (a string[] of the names of Projects/Tasks) into a reference
 * to a single Project/Task.
 *
 * - first token MUST be a Project
 * - everything after that is assumed to be tasks/subtasks
 */
export default class ContextResolver {

    /**
     * Finds the OmniFocus parent Project/Task that the context points to.
     *
     * @param contextSpec
     * @returns {*|null}
     */
    resolve(contextSpec) {
        if (!contextSpec || !contextSpec.length) {
            return null;
        } else {
            const omniFocus = new OmniFocus();
            let parent = omniFocus.getActiveProject(contextSpec.shift());
            while (contextSpec.length) {
                parent = omniFocus.getChild(parent, contextSpec.shift());
            }
            if (!parent) {
                throw new Error(`No such context: .${contextSpec.join('.')}`);
            } else {
                return parent;
            }
        }
    }

    /**
     * The context spec can contain shortened names. This returns a context spec with all
     * names resolved to the Project/Task they point to.
     *
     * @param contextSpec
     * @returns {*|null}
     */
    getCanonicalSpec(contextSpec) {
        if (!contextSpec || !contextSpec.length) {
            return null;
        } else {
            const omniFocus = new OmniFocus();
            const canonical = [];

            let context = omniFocus.getActiveProject(contextSpec.shift());
            canonical.push(context.name);
            while (contextSpec.length) {
                context = omniFocus.getChild(context, contextSpec.shift());
                canonical.push(context.name);
            }
            if (!context) {
                throw new Error(`No such context: .${contextSpec.join('.')}`);
            } else {
                return canonical;
            }
        }
    }
}
