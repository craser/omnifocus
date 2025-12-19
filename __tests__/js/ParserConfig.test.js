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

describe('ParserConfig', () => {
    test('Should load config from ~/.ofq-config.json', () => {
        cat.mockReturnValue('{ "rules": { "mock": "user-config.json" } }')
        let config = new ParserConfig();
        expect(config).toBeDefined();
        expect(cat).toHaveBeenCalledWith('$HOME/.ofq-config.json');
        expect(config.getRulesConfig()).toEqual({ mock: 'user-config.json' });
    });

    test('Should log where config was loaded from', () => {
        const expectedRules = { "rules": { "mock": "user-config.json" } };
        cat.mockReturnValue(JSON.stringify(expectedRules));
        const logSpy = jest.spyOn(global.console, 'log');
        let config = new ParserConfig();
        const actualRules = config.getRulesConfig();
        expect(actualRules).toEqual(expectedRules.rules);
        const loadingLogCall = logSpy.mock.calls.find(call => call[0].includes('loading'));
        expect(loadingLogCall).toBeDefined();
        const loadingMessage = loadingLogCall[0];
        expect(loadingMessage).toMatch(/loading.*from.*.ofq-config\.json/);
    });

    test('Should use JSON in config.json as default rules', () => {
        cat.mockReturnValue('');
        let json = cat('');
        console.log(json);

        let config = new ParserConfig();
        expect(cat).toHaveBeenCalled();
        expect(config.getRulesConfig()).toEqual({ mock: 'config' });
    });
});