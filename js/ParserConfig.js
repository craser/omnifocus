'use strict'

const fs = require("fs");

function loadUserConfig() {
    try {
        const home = process.env['HOME'];
        const configPath = `${home}/.ofq-config.json`;
        let json = fs.readFileSync(configPath);
        let config = JSON.parse(json);
        return config;
    } catch (e) {
        return {}
    }
}

function loadDefaultConfig() {
    let config = require('../config.json');
    return config;
}

function loadConfig() {
    let userConfig = loadUserConfig();
    let defaultConfig = loadDefaultConfig();
    let config = Object.assign(defaultConfig, userConfig);
    return config;
}

function getRulesConfig() {
    return this.config.rules || [];
}

function ParserConfig() {
    this.config = loadConfig();
    this.getRulesConfig = getRulesConfig;
}

module.exports = ParserConfig;
