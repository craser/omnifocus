const { execSync } = require("child_process");

class CmdRunner {
    execSync(cmd, args) {
        const output = execSync(cmd, args);
        return output;
    }
}

module.exports = CmdRunner;
