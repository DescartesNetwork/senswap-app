/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'http://localhost:8899',
  tokenFactoryAddress: '2MsLqshDGm9LtVU98hCny5XAXG77RXsXueKXJxKLf9RM',
  swapFactoryAddress: 'FqjXa5neZeJghrMDvx7uU6RDgf2o3beXpLQyX9FQ18aR'
}

/**
 * Staging configurations
 */
configs.staging = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: ''
}

/**
 * Production configurations
 */
configs.production = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: ''
}

/**
 * Module exports
 */
export default configs;