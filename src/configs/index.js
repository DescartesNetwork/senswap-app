import auth from './auth.config';
import api from './api.config';
import category from './category.config';

const env = process.env.REACT_APP_ENV || process.env.NODE_ENV;

const configs = {
  api: api[env],
}

/**
 * Module exports
 */
export default configs;
