// Setting up Global Mocks for Jest
const getMockDate = (function (Date) {
    return function () {
        return new Date('2021-01-01T08:00:00.000Z');
    }
}(Date));

global.Date = jest.fn(() => {
    var mockDate = getMockDate();
    return mockDate;
});

