/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'http://localhost:8899',
  tokenFactoryAddress: 'BcfSEsgAp5cfTS18CQTWibq63KJoR2Rkd6ENXu5AyaWU',
  swapFactoryAddress: '7yN9pkurnCAoe5F2TMiWXW48NC1rG1tKfHjK4eK1UHVJ',
}

/**
 * Staging configurations
 */
configs.staging = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: '',
}

/**
 * Production configurations
 */
configs.production = {
  node: '',
  tokenFactoryAddress: '',
  swapFactoryAddress: '',
}

/**
 * Module exports
 */
export default configs;