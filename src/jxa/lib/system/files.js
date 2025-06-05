/**
 * Nodes's fs module is not available in the osascript runtime, and dealing with AppleScript's is painful, so
 * I'm just gonna wrap up some shell commands.
 */
import { getUserHomeDir } from './user.js';
import { doScript } from './shell-script.js';

/**
 * Resolves things like ~ and $HOME to the full path.
 * @param path
 */
function resolvePath(path) {
    if (!path) {
        return path;
    } else {
        path = path.replace(/^~/, getUserHomeDir());
        path = path.replace(/^\$HOME/, getUserHomeDir());
        return path;
    }
}

/**
 * Returns the contents of the file at the specified path as a single string.
 *
 * @param path
 * @returns {string} - The contents of the file at the specified path.
 */
export function cat(path) {
    path = resolvePath(path);
    const contents = doScript(`cat "${path}"`);
    if (!contents) {
        throw new Error(`File not found: ${path}`);
    }
    return contents;
}

/**
 * list the contents of the given directory
 * @param dir
 * @returns {string[]} - An array of file names in the specified directory.
 */
export function list(dir) {
    dir = resolvePath(dir);
    return doScript(`ls ${dir}`);
}

/**
 * Finds files in the specified directory that match the specified pattern.
 * @param dir - directory to search in
 * @param pattern - see docs for the find command
 * @returns {string[]} - array of file names that match the specified pattern
 */
export function find(dir, pattern) {
    dir = resolvePath(dir);
    return doScript(`find "${dir}" -iname "${pattern}"`).split('\r');
}
