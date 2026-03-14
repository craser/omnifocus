class CmdRunner {

    getUserHomeDir() {
        ObjC.import('stdlib'); // TODO: consolidate this into a single import statement?
        const home = $.getenv('HOME');
        return home;
    }

    resolveHomeDirReferences(string) {
        const homeDir = this.getUserHomeDir();
        const resolved = string.replaceAll(/\$HOME/g, homeDir);
        return resolved;
    }

    execSync(cmd, args) {
        const resolvedCommand = this.resolveHomeDirReferences(cmd);
        const script = [resolvedCommand, ...args].map(s => `'${s}'`).join(' ');
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

module.exports = CmdRunner;
