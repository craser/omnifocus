// Setting up Global Mocks for Jest
const getMockDate = (function (Date) {
    return function () {
        return new Date(1466424490000);
    }
}(Date));

global.Date = jest.fn(() => {
    var mockDate = getMockDate();
    return mockDate;
});
