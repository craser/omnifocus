#!/usr/bin/env node

function parseContextSpec(meta) {
    var regex = /^.*?\.([^\s]+)\b.*$/;
    if (regex.test(meta)) {
        var contextSpec = meta.replace(regex, '$1')
            .split('.')
            .filter(x => x != '');
        return contextSpec;
    } else {
        return [];
    }
}

class ContextParser {
    parse(meta) {
        return parseContextSpec(meta);
    }
}

module.exports = ContextParser;
