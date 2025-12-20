const ContextTokenizer = require('src/jxa/lib/ContextTokenizer');

test('Should parse basic context', () => {
    var parser = new ContextTokenizer();
    var meta = '// .work.sucks.go.surfing';
    var spec = parser.parse(meta);
    expect(spec).toEqual(['work', 'sucks', 'go', 'surfing']);
})

test('Should parse single-quoted context segment', () => {
    var parser = new ContextTokenizer();
    var meta = '// .work."sucks".go.surfing';
    var spec = parser.parse(meta);
    expect(spec).toEqual(['work', 'sucks', 'go', 'surfing']);
});

test('Should parse double-quoted context segment', () => {
    var parser = new ContextTokenizer();
    var meta = '// .work.\'sucks\'.go.\'surfing\'';
    var spec = parser.parse(meta);
    expect(spec).toEqual(['work', 'sucks', 'go', 'surfing']);
});

test('Should parse double-quoted context', () => {
    var parser = new ContextTokenizer();
    var meta = '// ".work.sucks.go.surfing"';
    var spec = parser.parse(meta);
    expect(spec).toEqual(['work', 'sucks', 'go', 'surfing']);
});

test('Should parse single-quoted context', () => {
    var parser = new ContextTokenizer();
    var meta = '// \'.work.sucks.go.surfing\'';
    var spec = parser.parse(meta);
    expect(spec).toEqual(['work', 'sucks', 'go', 'surfing']);
});
