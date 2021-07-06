import ssjs from 'senswapjs';

import configs from 'configs';
import api from 'helpers/api';

/**
 * Documents
 * @default defaultData
 */
const defaultState = {}


/**
 * Get account data
 */
export const GET_ACCOUNT_DATA = 'GET_ACCOUNT_DATA';
export const GET_ACCOUNT_DATA_OK = 'GET_ACCOUNT_DATA_OK';
export const GET_ACCOUNT_DATA_FAIL = 'GET_ACCOUNT_DATA_FAIL';

export const getAccountData = (accountAddress, force = false) => {
  return async (dispatch, getState) => {
    dispatch({ type: GET_ACCOUNT_DATA });

    if (!ssjs.isAddress(accountAddress)) {
      const er = 'Invalid account address';
      dispatch({ type: GET_ACCOUNT_DATA_FAIL, reason: er });
      throw new Error(er);
    }

    let { bucket: { [accountAddress]: accountData } } = getState();
    if (accountData && !force) {
      const data = { [accountAddress]: accountData }
      dispatch({ type: GET_ACCOUNT_DATA_OK, data });
      return accountData;
    }

    try {
      const { api: { base } } = configs;
      accountData = await window.senswap.splt.getAccountData(accountAddress);
      const { data: mintData } = await api.get(base + '/mint', { address: accountData.mint.address });
      accountData.mint = { ...accountData.mint, ...mintData }
      const { mint_authority, freeze_authority } = accountData.mint || {};
      const poolAddress = await window.senswap.swap.derivePoolAddress(mint_authority, freeze_authority);
      if (ssjs.isAddress(poolAddress)) {
        accountData.pool = { address: poolAddress }
        const poolData = await window.senswap.swap.getPoolData(poolAddress);
        accountData.pool = { ...accountData.pool, ...poolData }
        const { data: re } = await api.get(base + '/pool', { address: poolAddress });
        const { mint_s, mint_a, mint_b, mint_lpt, ...others } = accountData.pool;
        const { mintS, mintA, mintB, mintLPT, ...someothers } = re;
        accountData.pool = {
          ...others, ...someothers,
          mint_s: { ...mint_s, ...mintS },
          mint_a: { ...mint_a, ...mintA },
          mint_b: { ...mint_b, ...mintB },
          mint_lpt: { ...mint_lpt, ...mintLPT },
        }
      }
      const data = { [accountAddress]: accountData }
      dispatch({ type: GET_ACCOUNT_DATA_OK, data });
      return accountData;
    } catch (er) {
      dispatch({ type: GET_ACCOUNT_DATA_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Get mint data
 */
export const GET_MINT_DATA = 'GET_MINT_DATA';
export const GET_MINT_DATA_OK = 'GET_MINT_DATA_OK';
export const GET_MINT_DATA_FAIL = 'GET_MINT_DATA_FAIL';

export const getMintData = (mintAddress, force = false) => {
  return async (dispatch, getState) => {
    dispatch({ type: GET_MINT_DATA });

    if (!ssjs.isAddress(mintAddress)) {
      const er = 'Invalid mint address';
      dispatch({ type: GET_MINT_DATA_FAIL, reason: er });
      throw new Error(er);
    }

    let { bucket: { [mintAddress]: mintData } } = getState();
    if (mintData && !force) {
      const data = { [mintAddress]: mintData };
      dispatch({ type: GET_MINT_DATA_OK, data });
      return mintData;
    }
    try {
      const { api: { base } } = configs;
      mintData = await window.senswap.splt.getMintData(mintAddress);
      const { data: re } = await api.get(base + '/mint', { address: mintAddress });
      mintData = { ...mintData, ...re }
      const data = { [mintAddress]: mintData }
      dispatch({ type: GET_MINT_DATA_OK, data });
      return mintData;
    } catch (er) {
      dispatch({ type: GET_MINT_DATA_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Get pool data
 */
export const GET_POOL_DATA = 'GET_POOL_DATA';
export const GET_POOL_DATA_OK = 'GET_POOL_DATA_OK';
export const GET_POOL_DATA_FAIL = 'GET_POOL_DATA_FAIL';

export const getPoolData = (poolAddress, force = false) => {
  return async (dispatch, getState) => {
    dispatch({ type: GET_POOL_DATA });

    if (!ssjs.isAddress(poolAddress)) {
      const er = 'Invalid pool address';
      dispatch({ type: GET_POOL_DATA_FAIL, reason: er });
      throw new Error(er);
    }

    let { bucket: { [poolAddress]: poolData } } = getState();
    if (poolData && !force) {
      const data = { [poolAddress]: poolData };
      dispatch({ type: GET_POOL_DATA_OK, data });
      return poolData;
    }

    try {
      const { api: { base } } = configs;
      poolData = await window.senswap.swap.getPoolData(poolAddress);
      const { data: re } = await api.get(base + '/pool', { address: poolAddress });
      const { mint_s, mint_a, mint_b, mint_lpt, ...others } = poolData;
      const { mintS, mintA, mintB, mintLPT, ...someothers } = re;
      poolData = {
        ...others, ...someothers,
        mint_s: { ...mint_s, ...mintS },
        mint_a: { ...mint_a, ...mintA },
        mint_b: { ...mint_b, ...mintB },
        mint_lpt: { ...mint_lpt, ...mintLPT }
      }
      const data = { [poolAddress]: poolData }
      dispatch({ type: GET_POOL_DATA_OK, data });
      return poolData;
    } catch (er) {
      dispatch({ type: GET_POOL_DATA_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}
/**
 * Get stake pool data
 */
export const GET_STAKE_POOL_DATA = 'GET_STAKE_POOL_DATA';
export const GET_STAKE_POOL_DATA_OK = 'GET_STAKE_POOL_DATA_OK';
export const GET_STAKE_POOL_DATA_FAIL = 'GET_STAKE_POOL_DATA_FAIL';

export const getStakePoolData = (stakePoolAddress, force = false) => {
  return async (dispatch, getState) => {
    dispatch({ type: GET_STAKE_POOL_DATA });

    let {
      bucket: { [stakePoolAddress]: stakePoolData },
    } = getState();

    //Cache
    if (stakePoolData && !force) {
      const data = { [stakePoolAddress]: stakePoolData };
      dispatch({ type: GET_STAKE_POOL_DATA_OK, data });
      return stakePoolData;
    }
    //New
    try {
      const {
        api: { base },
      } = configs;
      const liteFarming = window.senswap.farming;
      const { data: poolData } = await api.get(base + '/stake-pool', { address: stakePoolAddress });
      if(!poolData?.address) return;

      const stakePoolData = await liteFarming.getStakePoolData(stakePoolAddress);
      const dataStore = { [stakePoolAddress]: { ...poolData, ...stakePoolData } };
      dispatch({ type: GET_STAKE_POOL_DATA_OK, data: dataStore });
      return stakePoolData;
    } catch (er) {
      dispatch({ type: GET_STAKE_POOL_DATA_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  };
};

/**
 * Set item
 */
export const SET_ITEM = 'SET_ITEM';
export const SET_ITEM_OK = 'SET_ITEM_OK';
export const SET_ITEM_FAIL = 'SET_ITEM_FAIL';

export const setItem = (value) => {
  return async dispatch => {
    dispatch({ type: SET_ITEM });

    if (!value || !value.address) {
      const er = 'Invalid value';
      dispatch({ type: SET_ITEM_FAIL, reason: er });
      throw new Error(er);
    }

    const key = value.address;
    const data = { [key]: value }
    dispatch({ type: SET_ITEM_OK, data });
    return value;
  }
}

/**
 * Reducder
 */
// eslint-disable-next-line
export default (state = defaultState, action) => {
  switch (action.type) {
    case GET_ACCOUNT_DATA_OK:
      return { ...state, ...action.data };
    case GET_ACCOUNT_DATA_FAIL:
      return { ...state, ...action.data };
    case GET_MINT_DATA_OK:
      return { ...state, ...action.data };
    case GET_MINT_DATA_FAIL:
      return { ...state, ...action.data };
    case GET_POOL_DATA_OK:
      return { ...state, ...action.data };
    case GET_POOL_DATA_FAIL:
      return { ...state, ...action.data };
    case GET_STAKE_POOL_DATA_OK:
      return { ...state, ...action.data };
    case GET_STAKE_POOL_DATA_FAIL:
      return { ...state, ...action.data };
    case SET_ITEM_OK:
      return { ...state, ...action.data };
    case SET_ITEM_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}