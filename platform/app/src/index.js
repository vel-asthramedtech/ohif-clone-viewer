/**
 * Entry point for development and production PWA builds.
 * Modified to accept config from URL parameters
 */
import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import App from './App';
import React from 'react';

/**
 * EXTENSIONS AND MODES
 * =================
 * pluginImports.js is dynamically generated from extension and mode
 * configuration at build time.
 *
 * pluginImports.js imports all of the modes and extensions and adds them
 * to the window for processing.
 */
import { modes as defaultModes, extensions as defaultExtensions } from './pluginImports';
import loadDynamicConfig from './loadDynamicConfig';
export { history } from './utils/history';
export { preserveQueryParameters, preserveQueryStrings } from './utils/preserveQueryParameters';

/**
 * Get config from URL parameters if provided
 */
function getConfigFromURL() {
  const params = new URLSearchParams(window.location.search);
  const configParam = params.get('config');

  if (configParam) {
    try {
      const decoded = atob(configParam);
      const parsed = JSON.parse(decoded);
      console.log('Using config from URL parameters:', parsed);
      return parsed;
    } catch (error) {
      console.error('Failed to parse config from URL:', error);
      return null;
    }
  }
  return null;
}

loadDynamicConfig(window.config).then(config_json => {
  // Reset Dynamic config if defined
  if (config_json !== null) {
    window.config = config_json;
  }

  // Get config from URL and merge with window.config
  const urlConfig = getConfigFromURL();

  if (urlConfig && window.config) {
    // Only update specific properties, preserve the rest
    if (urlConfig.defaultDataSourceName) {
      window.config.defaultDataSourceName = urlConfig.defaultDataSourceName;
    }

    if (urlConfig.dataSources) {
      window.config.dataSources = urlConfig.dataSources;
    }
  }

  /**
   * Combine our appConfiguration with installed extensions and modes.
   * In the future appConfiguration may contain modes added at runtime.
   *  */
  const appProps = {
    config: window ? window.config : {},
    defaultExtensions,
    defaultModes,
  };

  const container = document.getElementById('root');

  const root = createRoot(container);
  root.render(React.createElement(App, appProps));
});
