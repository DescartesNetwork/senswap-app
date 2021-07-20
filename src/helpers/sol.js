import { getAccountData } from 'modules/bucket.reducer';
import ssjs from 'senswapjs';
import store from '../store'

const SOL = {}

SOL.scanAccount = async (mintAddress, walletAddress) => {
  if (!ssjs.isAddress(mintAddress)) throw new Error('Invalid token address');

  const splt = window.senswap.splt;
  const spltAddress = splt._splt.spltProgramId.toBase58();
  const splataAddress = splt._splt.splataProgramId.toBase58();

  let data = { address: '', state: 0 }
  data.address = await ssjs.deriveAssociatedAddress(walletAddress, mintAddress, spltAddress, splataAddress);
  try {
    const accountData = await store.dispatch(getAccountData(data.address));
    data = { ...data, ...accountData }
  } catch (er) {/* Nothing */ }
  return data;
}

SOL.newAccount = async (mintAddress, ownerAddress = null) => {
  if (!ssjs.isAddress(mintAddress)) throw new Error('Invalid token address');

  const splt = window.senswap.splt;
  const wallet = window.senswap.wallet;
  const spltAddress = splt._splt.spltProgramId.toBase58();
  const splataAddress = splt._splt.splataProgramId.toBase58();
  const walletAddress = ownerAddress || await wallet.getAccount();
  const accountAddress = await ssjs.deriveAssociatedAddress(walletAddress, mintAddress, spltAddress, splataAddress);

  try {
    const accountData = await store.dispatch(getAccountData(accountAddress));
    const { address } = accountData;
    if (!ssjs.isAddress(address)) throw new Error('Account has not been initialized');
    return { address }
  } catch (er) {
    const { accountAddress: address, txId } = await splt.initializeAccount(mintAddress, wallet, ownerAddress);
    return { address, txId }
  }
}

export default SOL;