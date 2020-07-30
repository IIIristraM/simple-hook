module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
        'ts-jest': {
            isolatedModules: true
        }
    },
    // setupFilesAfterEnv: ["<rootDir>/__test__/setup.js"],
};