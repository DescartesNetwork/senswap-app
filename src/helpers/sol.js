import ssjs from 'senswapjs';

import configs from 'configs';


const SOL = {}

SOL.isMintLPTAddress = async (mintAuthorityAddress, freezeAuthorityAddress) => {
  const { sol: { swapAddress } } = configs;
  try {
    const poolAddress = await ssjs.isMintLPTAddress(mintAuthorityAddress, freezeAuthorityAddress, swapAddress);
    if (!ssjs.isAddress(poolAddress)) return false;
    return poolAddress;
  }
  catch (er) {
    return false;
  }
}

SOL.scanAccount = async (mintAddress, walletAddress) => {
  if (!ssjs.isAddress(mintAddress)) throw new Error('Invalid token address');

  const splt = window.senswap.splt;
  const spltAddress = splt.spltProgramId.toBase58();
  const splataAddress = splt.splataProgramId.toBase58();

  let data = { address: '', state: 0 }
  data.address = await ssjs.deriveAssociatedAddress(walletAddress, mintAddress, spltAddress, splataAddress);
  try {
    const accountData = await splt.getAccountData(data.address);
    data = { ...data, ...accountData }
  } catch (er) {/* Nothing */ }
  return data;
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