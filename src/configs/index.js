import api from './api.config';
import sol from './sol.config';

const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;

const configs = {
  api: api[env],
  sol: sol[env],
}

/**
 * Module exports
 */
export default configs;
