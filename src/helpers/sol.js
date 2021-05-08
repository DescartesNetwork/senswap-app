import ssjs from 'senswapjs';

import configs from 'configs';


const SOL = {}

SOL.isMintLPTAddress = (mintAuthorityAddress, freezeAuthorityAddress) => {
  return new Promise((resolve, _) => {
    const { sol: { swapAddress } } = configs;
    return ssjs.isMintLPTAddress(mintAuthorityAddress, freezeAuthorityAddress, swapAddress).then(poolAddress => {
      if (!ssjs.isAddress(poolAddress)) return resolve(false);
      return resolve(poolAddress);
    }).catch(er => {
      return resolve(false);
    });
  });
}

SOL.scanAccount = (mintAddress, walletAddress) => {
  return new Promise((resolve, reject) => {
    if (!ssjs.isAddress(mintAddress)) return reject('Invalid token address');

    const splt = window.senswap.splt;
    const spltAddress = splt.spltProgramId.toBase58();
    const splataAddress = splt.splataProgramId.toBase58();

    let data = { address: '', state: 0 }
    return ssjs.deriveAssociatedAddress(walletAddress, mintAddress, spltAddress, splataAddress).then(re => {
      data.address = re;
      return splt.getAccountData(data.address);
    }).then(re => {
      data = { ...data, ...re };
      return resolve(data);
    }).catch(er => {
      if (data.address) return resolve(data);
      return reject(er);
    });
  });
}

SOL.newAccount = (mintAddress) => {
  return new Promise((resolve, reject) => {
    if (!ssjs.isAddress(mintAddress)) return reject('Invalid token address');

    const splt = window.senswap.splt;
    const wallet = window.senswap.wallet;
    const spltAddress = splt.spltProgramId.toBase58();
    const splataAddress = splt.splataProgramId.toBase58();
    let address = null;
    return wallet.getAccount().then(walletAddress => {
      return ssjs.deriveAssociatedAddress(walletAddress, mintAddress, spltAddress, splataAddress);
    }).then(re => {
      address = re;
      return splt.getAccountData(address);
    }).then(data => {
      if (data) return resolve({ address });
    }).catch(er => {
      return splt.initializeAccount(address, mintAddress, wallet);
    }).then(txId => {
      return resolve({ address, txId });
    }).catch(er => {
      return reject(er);
    });
  });
}

export default SOL;