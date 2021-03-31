import api from './api.config';
import sol from './sol.config';
import basics from './basics.config';

const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;

const configs = {
  env,
  api: api[env],
  sol: sol[env],
  basics: basics[env],
}

console.log(configs);

/**
 * Module exports
 */
export default configs;
