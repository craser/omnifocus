const { execSync } = require("child_process");

module.exports = function CmdRunner() {
    this.execSync = function(cmd, args) {
        const output = execSync(cmd, args);
        return output;
    }
}
