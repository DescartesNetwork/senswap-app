/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  base: 'http://localhost:3001',
}

/**
 * Staging configurations
 */
configs.staging = {
  base: 'ec2-18-216-74-17.us-east-2.compute.amazonaws.com',
}

/**
 * Production configurations
 */
configs.production = {
  base: 'https://api.senswap.io',
}

/**
 * Module exports
 */
export default configs;