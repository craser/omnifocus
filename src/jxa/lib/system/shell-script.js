'use strict';

export function doScript(script) {
    try {
        const a = Application.currentApplication();
        a.includeStandardAdditions = true;
        const stdout = a.doShellScript(`${script} 2>&1`);
        const exitCodeString = a.doShellScript('echo $?');
        const exitCode = parseInt(exitCodeString);

        console.log(`doScript: ${script}`);
        console.log(`stdout: ${stdout}`);
        console.log(`exitCode (string): ${exitCodeString}`);
        console.log(`exitCode (parsed): ${exitCode}`);


        if (exitCode !== 0) {
            throw new Error(stdout.join('\n'));
        }
        return stdout;
    } catch (error) {
        console.log(`doScript error: ${error}`);
        throw error;
    }
}
