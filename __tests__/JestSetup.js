// Setting up Global Mocks for Jest
const getMockDate = (function (Date) {
    return function (arg) {
        if (arg) {
            return new Date(arg);
        } else {
            return new Date('2021-01-01T08:00:00.000Z');
        }
    }
}(Date));

global.Date = jest.fn((arg) => {
    var mockDate = getMockDate(arg);
    return mockDate;
});

