#!/Users/craser/.nvm/versions/node/v10.23.0/bin/node

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

function ContextParser() {
    this.parse = parseContextSpec
}

module.exports = ContextParser;
