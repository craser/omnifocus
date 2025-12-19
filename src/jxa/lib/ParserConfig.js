'use strict'

import { cat } from './system/files.js';
import defaultConfig from '../../../config.json';

function loadUserConfig() {
    try {
        const configPath = `$HOME/.ofq-config.json`;
        console.log(`loading config from ${configPath}`);
        const json = cat(configPath);
        const config = JSON.parse(json);
        return config;
    } catch (e) {
        return {}
    }
}

function loadConfig() {
    let userConfig = loadUserConfig();
    const config = { ...defaultConfig, ...userConfig };
    return config;
}

export default class ParserConfig {
    constructor() {
        this.config = loadConfig();
    }

    getRulesConfig() {
        return this.config.rules || [];
    }
}
