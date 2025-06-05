// Setting up Global Mocks for Jest
const RealDate = Date;

global.Date = class extends RealDate {
    constructor(...args) {
        if (args.length === 0) {
            super('2021-01-01T08:00:00.000Z');
        } else {
            super(...args);
        }
    }
    
    static now() {
        return new RealDate('2021-01-01T08:00:00.000Z').getTime();
    }
};

