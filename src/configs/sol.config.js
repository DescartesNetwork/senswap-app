/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'http://localhost:8899',
  tokenFactoryAddress: '2MsLqshDGm9LtVU98hCny5XAXG77RXsXueKXJxKLf9RM'
}

/**
 * Staging configurations
 */
configs.staging = {
  node: '',
  tokenFactoryAddress: '2MsLqshDGm9LtVU98hCny5XAXG77RXsXueKXJxKLf9RM'
}

/**
 * Production configurations
 */
configs.production = {
  node: '',
  tokenFactoryAddress: ''
}

/**
 * Module exports
 */
export default configs;