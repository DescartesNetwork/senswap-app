import { forever } from 'async';
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

SOL.scanSRC20Account = (tokenAddress, secretKey) => {
  return new Promise((resolve, reject) => {
    if (!ssjs.isAddress(tokenAddress)) return reject('Invalid token address');
    let nextIndex = 0;
    let nextPath = null;
    let nextAccount = null;
    let data = [];
    return forever(next => {
      nextPath = SOL.tokenPath(tokenAddress, nextIndex);
      nextAccount = ssjs.deriveChild(secretKey, nextPath);
      const address = nextAccount.publicKey.toBase58();
      return window.senwallet.src20.getAccountData(address).then(re => {
        data.push(re);
        nextIndex = nextIndex + 1;
        return next();
      }).catch(er => {
        return next(er);
      });
    }, er => {
      return resolve({ data, nextIndex, nextPath, nextAccount });
    });
  });
}

SOL.newSRC20Account = (tokenAddress, secretKey) => {
  return new Promise((resolve, reject) => {
    if (!ssjs.isAddress(tokenAddress)) return reject('Invalid token address');
    let account = null;
    return SOL.scanSRC20Account(tokenAddress, secretKey).then(({ nextAccount }) => {
      account = nextAccount;
      const payer = ssjs.fromSecretKey(secretKey);
      return window.senwallet.src20.newAccount(account, tokenAddress, payer);
    }).then(txId => {
      return resolve({ account, txId });
    }).catch(er => {
      return reject(er);
    });
  });
}

export default SOL;