/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'http://localhost:8899',
  tokenFactoryAddress: 'D5cRXHjf8aMpdSgjTMf2tGuEJRSEF5azVGbYmKZeRFxc',
  swapFactoryAddress: '7yN9pkurnCAoe5F2TMiWXW48NC1rG1tKfHjK4eK1UHVJ'
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