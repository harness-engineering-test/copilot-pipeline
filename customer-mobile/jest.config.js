module.exports = {
  projects: [
    {
      displayName: 'native',
      preset: 'jest-expo',
      testMatch: [
        '**/__tests__/screens/**/*.test.{ts,tsx}',
        '**/__tests__/components/**/*.test.{ts,tsx}',
        '**/__tests__/hooks/**/*.test.{ts,tsx}',
      ],
      transformIgnorePatterns: [
        '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base))',
      ],
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/utils/**',
      ],
    },
    {
      displayName: 'node',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/utils/**/*.test.ts'],
      collectCoverageFrom: [
        'src/utils/**/*.ts',
        '!src/**/*.d.ts',
      ],
    },
  ],
};
