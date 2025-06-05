/**
 * Filters the raw argv array to remove the first few elements that specify the runtime, runtime args, and the
 * currently executing script.
 *
 * I've got some really hacky guardrails around this for now.
 */
function getScriptArgs(all) {
    let firstScriptArgIndex = Math.max(0, all.findIndex((arg) => arg.endsWith('.js')));
    return all.slice(firstScriptArgIndex + 1);
}

export function getCommandLineArgs() {
    ObjC.import('stdlib'); // TODO: consolidate this into a single import statement?
    const args = $.NSProcessInfo.processInfo.arguments;
    const unwrapped = [];
    for (let i = 0; i < args.count; i++) {
        const value = ObjC.unwrap(args.objectAtIndex(i));
        unwrapped.push(value);
    }
    return {
        argv: unwrapped,
        scriptArgs: getScriptArgs(unwrapped),
    };
}
