const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    include:     ['tests/unit/**/*.spec.js'],
    environment: 'node',
    reporter:    'verbose',
    globals:     true
  }
});