module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.base.json',
            isolatedModules: true,
        },
    },
    // setupFilesAfterEnv: ["<rootDir>/__test__/setup.js"],
};
