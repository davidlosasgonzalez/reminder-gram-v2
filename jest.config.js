module.exports = {
    collectCoverageFrom: [
        'apps/telegram-bot/src/**/*.(t|j)s',
        'libs/**/*.(t|j)s',
    ],
    coverageDirectory: './coverage',
    moduleFileExtensions: ['js', 'json', 'ts'],
    moduleNameMapper: {
        '^@calendar/(.*)$': '<rootDir>/libs/calendar/src/$1',
        '^@config/(.*)$': '<rootDir>/libs/config/src/$1',
        '^@llm/(.*)$': '<rootDir>/libs/llm/src/$1',
        '^@scheduler/(.*)$': '<rootDir>/libs/scheduler/src/$1',
        '^@shared/(.*)$': '<rootDir>/libs/shared/src/$1',
        '^@telegram/(.*)$': '<rootDir>/libs/telegram/src/$1',
        '^@telegram-bot/(.*)$': '<rootDir>/apps/telegram-bot/src/$1',
    },
    rootDir: '.',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
};
