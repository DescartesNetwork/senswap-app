/**
 * Contructor
 */
const configs = {}

const PERMISSION = ['operator', 'admin'];

/**
 * Development configurations
 */
configs.development = {
  permission: [...PERMISSION],
}

/**
 * Staging configurations
 */
configs.staging = {
  permission: [...PERMISSION],
}

/**
 * Production configurations
 */
configs.production = {
  permission: [...PERMISSION],
}

/**
 * Module exports
 */
export default configs;