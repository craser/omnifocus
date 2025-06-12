import ParserConfig  from 'src/jxa/lib/ParserConfig';

test('should exist', () => {
    expect(ParserConfig).toBeDefined();
});

test('create new for debugging', () => {
    let config = new ParserConfig();
    expect(config).toBeDefined();
});
