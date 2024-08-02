function findQuotedStrings(string) {
    var strings = [];
    string.replace(/"([^"]+)"/g, function (m, s) {
        strings.push(s);
    });
    return strings;
}

test('findQuotedStrings', () => {
    expect(findQuotedStrings('foo "bar" baz')).toEqual(['bar']);
    expect(findQuotedStrings('foo "bar" baz "qux"')).toEqual(['bar', 'qux']);
});
