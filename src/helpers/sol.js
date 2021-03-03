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

SOL.scanAccount = (mintAddress, secretKey) => {
  return new Promise((resolve, reject) => {
    if (!ssjs.isAddress(mintAddress)) return reject('Invalid token address');

    const splt = window.senwallet.splt;
    const payer = ssjs.fromSecretKey(secretKey);
    const walletAddress = payer.publicKey.toBase58();
    const spltAddress = splt.spltProgramId.toBase58();
    const splataAddress = splt.splataProgramId.toBase58();

    let data = {}
    return ssjs.deriveAssociatedAddress(walletAddress, mintAddress, spltAddress, splataAddress).then(re => {
      data.address = re;
      return splt.getAccountData(data.address);
    }).then(re => {
      data = { ...data, ...re };
      return resolve(data);
    }).catch(er => {
      if (data.address) return resolve(data);
      return reject('Cannot parse data');
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

SOL.newAccount = (mintAddress, secretKey) => {
  return new Promise((resolve, reject) => {
    if (!ssjs.isAddress(mintAddress)) return reject('Invalid token address');

    const splt = window.senwallet.splt;
    const payer = ssjs.fromSecretKey(secretKey);
    const walletAddress = payer.publicKey.toBase58();
    const spltAddress = splt.spltProgramId.toBase58();
    const splataAddress = splt.splataProgramId.toBase58();
    let address = null;
    return ssjs.deriveAssociatedAddress(walletAddress, mintAddress, spltAddress, splataAddress).then(re => {
      address = re;
      return splt.getAccountData(address);
    }).then(data => {
      if (data) return resolve({ address });
    }).catch(er => {
      return splt.initializeAccount(address, mintAddress, payer);
    }).then(txId => {
      return resolve({ address, txId });
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
      return window.senwallet.swap.initializeLPT(lpt, poolAddress, payer);
    }).then(txId => {
      return resolve({ lpt, txId });
    }).catch(er => {
      return reject(er);
    });
  });
}

export default SOL;