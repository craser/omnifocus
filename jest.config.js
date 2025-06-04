// jest.config.js
export default {
    collectCoverage: true,
    testMatch: [
        '**/__tests__/**/*.js',
    ],
    moduleFileExtensions: [
        'js',
    ],
    testEnvironment: 'node', // Use the Node environment for testing
    roots: ['<rootDir>'], // Root directory for tests
    transform: {
        '^.+\\.js$': 'babel-jest', // Optional if using Babel for newer JS features
    },
    modulePaths: [
        '<rootDir>', // Include the root directory in module resolution
    ],
    moduleNameMapper: {
        "~/(.*)$": "<rootDir>/$1", // Map '~' to the root directory
    }
};
