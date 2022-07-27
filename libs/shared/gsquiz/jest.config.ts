/* eslint-disable */
export default {
  displayName: 'shared-gsquiz',
  preset: '../../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^firebase-admin/app$':
      '<rootDir>/../../../node_modules/firebase-admin/lib/app/index.js',
    '^firebase-admin/firestore$':
      '<rootDir>/../../../node_modules/firebase-admin/lib/firestore/index.js',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/gsquiz',
}
