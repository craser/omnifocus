import ParserConfig  from 'src/jxa/lib/ParserConfig';
import { cat } from 'src/jxa/lib/system/files.js';

jest.mock('src/jxa/lib/system/files.js', () => {
    return {
        cat: jest.fn()
    }
});

jest.mock('/Users/craser/dev/cjr/wk/omnifocus/config.json', () => ({
    rules: { mock: 'config' }
}));

beforeEach(() => {
    jest.resetAllMocks();
});

test('Should load config from ~/.ofq-config.json', () => {
    cat.mockReturnValue('{ "rules": { "mock": "user-config.json" } }')
    let config = new ParserConfig();
    expect(config).toBeDefined();
    expect(cat).toHaveBeenCalledWith('$HOME/.ofq-config.json');
    expect(config.getRulesConfig()).toEqual({ mock: 'user-config.json' });
});

test('Should use JSON in config.json as default rules', () => {
    cat.mockReturnValue('');
    let json = cat('');
    console.log(json);
    
    let config = new ParserConfig();
    expect(cat).toHaveBeenCalled();
    expect(config.getRulesConfig()).toEqual({ mock: 'config' });
});
