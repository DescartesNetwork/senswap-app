import ssjs from 'senswapjs';
import configs from 'configs';


const SOL = {}

SOL.tokenPath = (tokenAddress, index) => {
  if (!ssjs.isAddress(tokenAddress)) return null;
  const { sol: { tokenFactoryAddress } } = configs;
  const indexAddress = ssjs.toPathAddress(index.toString());
  const path = `m/${tokenFactoryAddress}/${tokenAddress}/${indexAddress}`;
  return path;
}

SOL.scanTheNextAvailableAccount = (secretKey, tokenAddress) => {
  return '0';
}

export default SOL;