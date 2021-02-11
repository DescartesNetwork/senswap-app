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

SOL.poolPath = (poolAddress, index) => {
  if (!ssjs.isAddress(poolAddress)) return null;
  const { sol: { swapFactoryAddress } } = configs;
  const indexAddress = ssjs.toPathAddress(index.toString());
  const path = `m/${swapFactoryAddress}/${poolAddress}/${indexAddress}`;
  return path;
}

SOL.scanAccount = (tokenAddress, secretKey) => {
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

SOL.scanLPT = (poolAddress, secretKey) => {
  return new Promise((resolve, reject) => {
    if (!ssjs.isAddress(poolAddress)) return reject('Invalid token address');
    let nextIndex = 0;
    let nextPath = null;
    let nextLPT = null;
    let data = [];
    return forever(next => {
      nextPath = SOL.poolPath(poolAddress, nextIndex);
      nextLPT = ssjs.deriveChild(secretKey, nextPath);
      const address = nextLPT.publicKey.toBase58();
      return window.senwallet.swap.getLPTData(address).then(re => {
        data.push(re);
        nextIndex = nextIndex + 1;
        return next();
      }).catch(er => {
        return next(er);
      });
    }, er => {
      return resolve({ data, nextIndex, nextPath, nextLPT });
    });
  });
}

SOL.newAccount = (tokenAddress, secretKey) => {
  return new Promise((resolve, reject) => {
    if (!ssjs.isAddress(tokenAddress)) return reject('Invalid token address');
    let account = null;
    return SOL.scanAccount(tokenAddress, secretKey).then(({ nextAccount }) => {
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

SOL.newLPT = (poolAddress, secretKey) => {
  return new Promise((resolve, reject) => {
    if (!ssjs.isAddress(poolAddress)) return reject('Invalid pool address');
    let lpt = null;
    return SOL.scanLPT(poolAddress, secretKey).then(({ nextLPT }) => {
      lpt = nextLPT;
      const payer = ssjs.fromSecretKey(secretKey);
      return window.senwallet.swap.newLPT(lpt, payer);
    }).then(txId => {
      return resolve({ lpt, txId });
    }).catch(er => {
      return reject(er);
    });
  });
}

export default SOL;