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
  swapFactoryAddress: '3GgoSjT3P2QxWuZWDcDxEmKTNGRgESt2TjS7mBERUygg'
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