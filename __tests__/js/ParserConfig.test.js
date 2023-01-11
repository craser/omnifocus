const ParserConfig = require('js/ParserConfig');

test('should exist', () => {
    expect(ParserConfig).toBeDefined();
});

test('create new for debugging', () => {
    let config = new ParserConfig();
    expect(config).toBeDefined();
});
