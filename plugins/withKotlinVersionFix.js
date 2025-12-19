const { withGradleProperties } = require('@expo/config-plugins');

const withKotlinVersionFix = (config) => {
  return withGradleProperties(config, (config) => {
    // Add suppressKotlinVersionCompatibilityCheck to gradle.properties
    config.modResults.push({
      type: 'property',
      key: 'kotlin.suppressKotlinVersionCompatibilityCheck',
      value: 'true',
    });
    return config;
  });
};

module.exports = withKotlinVersionFix;
