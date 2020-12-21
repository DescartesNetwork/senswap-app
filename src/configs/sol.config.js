/**
 * Contructor
 */
const configs = {}

/**
 * Development configurations
 */
configs.development = {
  node: 'http://localhost:8899',
  tokenFactoryAddress: '6D5sUPSzXsLPtDxBpi8fngu83FPk54CvpinX3zzZovTr',
  swapFactoryAddress: '12knhNC8J3sdVwHDcWNtwtHD85jY1nHWNwHE9EuK8iZE'
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