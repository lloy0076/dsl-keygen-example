module.exports = {
  env: { browser: true },
  extends: [
    'airbnb-base',
    'plugin:react/recommended',
  ],
  rules: {
    // Show warnings rather than errors; there's too much to fix.
    // Also we like 4 spaces.
    'indent': [
      'warn',
      4,
    ],
    // Let `git` handle this.
    'linebreak-style': [
      'off',
    ],
    'max-len': [
      'warn',
      120,
    ],
  }
};
