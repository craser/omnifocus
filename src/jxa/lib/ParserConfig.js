'use strict'

import { cat } from './system/files.js';
import defaultConfig from '../../../config.json';

function loadUserConfig() {
    try {
        const home = process.env['HOME'];
        const configPath = `${home}/.ofq-config.json`;
        const json = cat(configPath);
        const config = JSON.parse(json);
        return config;
    } catch (e) {
        return {}
    }
}

function loadConfig() {
    let userConfig = loadUserConfig();
    const config = Object.assign(defaultConfig, userConfig);
    return config;
}

class ParserConfig {
    constructor() {
        this.config = loadConfig();
    }

    getRulesConfig() {
        return this.config.rules || [];
    }
}

module.exports = ParserConfig;
