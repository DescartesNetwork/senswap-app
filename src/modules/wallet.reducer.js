import ssjs from 'senswapjs';
import configs from 'configs';
import session from 'helpers/session';
import api from 'helpers/api';

// const farming = new ssjs.Farming();

/**
 * Documents
 * @default defaultData
 */
const defaultState = {
  visible: false,
  lamports: 0,
  user: {
    address: null,
    role: 'user',
  },
  stakeAccounts: [],
  accounts: [],
  lpts: [],
}

const MAX_ACCOUNTS = 100;


/**
 * Open wallet
 */
export const OPEN_WALLET = 'OPEN_WALLET';
export const OPEN_WALLET_OK = 'OPEN_WALLET_OK';
export const OPEN_WALLET_FAIL = 'OPEN_WALLET_FAIL';

export const openWallet = () => {
  return async (dispatch, getState) => {
    dispatch({ type: OPEN_WALLET });

    const { wallet: { visible } } = getState();
    if (visible) {
      const er = 'Wallet is already opened';
      dispatch({ type: OPEN_WALLET_FAIL, reason: er });
      throw new Error(er);
    }

    const data = { visible: true };
    dispatch({ type: OPEN_WALLET_OK, data });
    return data;
  }
}

/**
 * Close wallet
 */
export const CLOSE_WALLET = 'CLOSE_WALLET';
export const CLOSE_WALLET_OK = 'CLOSE_WALLET_OK';
export const CLOSE_WALLET_FAIL = 'CLOSE_WALLET_FAIL';

export const closeWallet = () => {
  return async (dispatch, getState) => {
    dispatch({ type: CLOSE_WALLET });

    const { wallet: { visible } } = getState();
    if (!visible) {
      const er = 'Wallet is already closed';
      dispatch({ type: CLOSE_WALLET_FAIL, reason: er });
      throw new Error(er);
    }

    const data = { visible: false };
    dispatch({ type: CLOSE_WALLET_OK, data });
    return data;
  }
}

/**
 * Set wallet
 */
export const SET_WALLET = 'SET_WALLET';
export const SET_WALLET_OK = 'SET_WALLET_OK';
export const SET_WALLET_FAIL = 'SET_WALLET_FAIL';

export const setWallet = (wallet) => {
  return async dispatch => {
    dispatch({ type: SET_WALLET });

    if (!wallet) {
      const er = 'Invalid wallet instance';
      dispatch({ type: SET_WALLET_FAIL, reason: er });
      throw new Error(er);
    }

    // Configs
    const {
      api: { base },
      // sol: { farmingAddress },
    } = configs;
    const lamports = window.senswap.lamports;
    const splt = window.senswap.splt;
    const connection = splt._splt.connection;
    const spltProgramId = splt._splt.spltProgramId;
    const data = {
      user: { address: '' },
      lamports: 0,
      accounts: [],
      stakeAccounts: [],
      lpts: [],
      visible: false
    }
    // Set wallet
    window.senswap.wallet = wallet;
    try {
      // Fetch general address & lamports
      data.user.address = await wallet.getAccount();
      data.lamports = await lamports.get(data.user.address);
      // Fetch mint accounts and lpt accounts
      const ownerPublicKey = ssjs.fromAddress(data.user.address);
      const { value } = await connection.getTokenAccountsByOwner(ownerPublicKey, { programId: spltProgramId });
      const full = value.map(({ pubkey }) => pubkey.toBase58());
      // Filter mint accounts
      const { data: mints } = await api.get(base + '/mints', { condition: {}, limit: -1, page: 0 });
      const derivedAccountAddresses = await Promise.all(mints.map(({ address: mintAddress }) => {
        const spltAddress = window.senswap.splt._splt.spltProgramId.toBase58();
        const splataAddress = window.senswap.splt._splt.splataProgramId.toBase58();
        return ssjs.deriveAssociatedAddress(data.user.address, mintAddress, spltAddress, splataAddress);
      }));
      data.accounts = full.filter(accountAddress => derivedAccountAddresses.includes(accountAddress));
      // Filter lpt accounts
      let { data: pools } = await api.get(base + '/pools', { condition: {}, limit: -1, page: 0 });
      pools = pools.map(({ address: poolAddress }) => poolAddress);
      const rest = full.filter(accountAddress => !data.accounts.includes(accountAddress));
      let counter = 0;
      for (const accountAddress of rest) {
        if (counter++ > MAX_ACCOUNTS) break;
        try {
          const { mint } = await splt.getAccountData(accountAddress);
          const { mint_authority, freeze_authority } = mint || {};
          const poolAddress = await window.senswap.swap.derivePoolAddress(mint_authority, freeze_authority);
          if (!ssjs.isAddress(poolAddress) || !pools.includes(poolAddress)) continue;
          data.lpts.push(accountAddress);
        } catch (er) { /* Nothing */ }
      }

      //Filter Stake Pool Accounts
      // const farmingProgramId = ssjs.fromAddress(farmingAddress);
      // const farmingAccounts = await connection.getProgramAccounts(farmingProgramId, {
      //   commitment: "confirmed",
      //   encoding: "jsonParsed",
      //   filters: [
      //     {
      //       memcmp: {
      //         bytes: ownerPublicKey.toBase58(),
      //         offset: 32,
      //       },
      //     },
      //   ],
      // });

      //Filter DebtAddress with stakePools in database
      // const ownerAddress = await wallet.getAccount();
      // let { data: stakePools } = await api.get(base + '/stake-pools', { condition: {}, limit: -1, page: 0 });
      // const debtAddressInvalid = await Promise.all(stakePools.map(pool => farming._deriveDebtAddress(ownerAddress, pool.address)))

      // const ownerDebtAddr = farmingAccounts.filter(debtData => debtAddressInvalid.includes(debtData.pubkey.toBase58()))
      // data.stakeAccounts = ownerDebtAddr.map((acc) => acc.pubkey.toBase58());

      // Add user to database
      let userData = await api.get(base + '/user', { address: data.user.address });
      if (!userData.data && data.lamports) {
        userData = await api.post(base + '/user', { user: { address: data.user.address } });
      }
      data.user = { ...data.user, ...userData.data }
      // Success
      dispatch({ type: SET_WALLET_OK, data });
      return data;
    } catch (er) {
      dispatch({ type: SET_WALLET_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Update wallet
 */
export const UPDATE_WALLET = 'UPDATE_WALLET';
export const UPDATE_WALLET_OK = 'UPDATE_WALLET_OK';
export const UPDATE_WALLET_FAIL = 'UPDATE_WALLET_FAIL';

export const updateWallet = (data) => {
  return dispatch => {
    dispatch({ type: UPDATE_WALLET });

    if (!data) {
      const er = 'Invalid data';
      dispatch({ type: UPDATE_WALLET_FAIL, reason: er });
      throw new Error(er);
    }

    data = JSON.parse(JSON.stringify(data));
    dispatch({ type: UPDATE_WALLET_OK, data });
    return data;
  }
}

/**
 * Unset wallet
 */
export const UNSET_WALLET = 'UNSET_WALLET';
export const UNSET_WALLET_OK = 'UNSET_WALLET_OK';
export const UNSET_WALLET_FAIL = 'UNSET_WALLET_FAIL';

export const unsetWallet = () => {
  return async (dispatch, getState) => {
    dispatch({ type: UNSET_WALLET });

    const { wallet: { user: { address } } } = getState();
    if (!address) {
      const er = 'Already disconnected';
      dispatch({ type: UNSET_WALLET_FAIL, reason: er });
      throw new Error(er);
    }

    // Session storage
    session.clear('WalletType');
    session.clear('SecretKey');

    const data = { ...defaultState };
    dispatch({ type: UNSET_WALLET_OK, data });
    return data;
  }
}

/**
 * Reducder
 */
// eslint-disable-next-line
export default (state = defaultState, action) => {
  switch (action.type) {
    case OPEN_WALLET_OK:
      return { ...state, ...action.data };
    case OPEN_WALLET_FAIL:
      return { ...state, ...action.data };
    case CLOSE_WALLET_OK:
      return { ...state, ...action.data };
    case CLOSE_WALLET_FAIL:
      return { ...state, ...action.data };
    case SET_WALLET_OK:
      return { ...state, ...action.data };
    case SET_WALLET_FAIL:
      return { ...state, ...action.data };
    case UPDATE_WALLET_OK:
      return { ...state, ...action.data };
    case UPDATE_WALLET_FAIL:
      return { ...state, ...action.data };
    case UNSET_WALLET_OK:
      return { ...state, ...action.data };
    case UNSET_WALLET_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}
