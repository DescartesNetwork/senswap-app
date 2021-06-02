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
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_ACCOUNT_DATA });

      if (!ssjs.isAddress(accountAddress)) {
        const er = 'Invalid account address';
        dispatch({ type: GET_ACCOUNT_DATA_FAIL, reason: er });
        return reject(er);
      }

      let { bucket: { [accountAddress]: accountData } } = getState();
      if (accountData && !force) {
        const data = { [accountAddress]: accountData }
        dispatch({ type: GET_ACCOUNT_DATA_OK, data });
        return resolve(accountData);
      }

      const { api: { base } } = configs;
      return window.senswap.splt.getAccountData(accountAddress).then(re => {
        accountData = { ...re }
        return api.get(base + '/mint', { address: re.mint.address });
      }).then(({ data: re }) => {
        accountData.mint = { ...accountData.mint, ...re }
        const { mint_authority, freeze_authority } = accountData.mint || {};
        return window.senswap.swap._swap.derivePoolAddress(mint_authority, freeze_authority);
      }).then(poolAddress => {
        // It is token account -> Break the promise chain
        if (!ssjs.isAddress(poolAddress)) return Promise.reject('No error');
        // It is lpt account
        accountData.pool = { address: poolAddress }
        return window.senswap.swap.getPoolData(poolAddress);
      }).then(re => {
        accountData.pool = { ...accountData.pool, ...re }
        return api.get(base + '/pool', { address: re.address });
      }).then(({ data: re }) => {
        const { mint_s, mint_a, mint_b, mint_lpt, ...others } = accountData.pool;
        const { mintS, mintA, mintB, mintLPT, ...someothers } = re;
        accountData.pool = {
          ...others, ...someothers,
          mint_s: { ...mint_s, ...mintS },
          mint_a: { ...mint_a, ...mintA },
          mint_b: { ...mint_b, ...mintB },
          mint_lpt: { ...mint_lpt, ...mintLPT },
        }
        const data = { [accountAddress]: accountData }
        dispatch({ type: GET_ACCOUNT_DATA_OK, data });
        return resolve(accountData);
      }).catch(er => {
        if (er === 'No error') {
          const data = { [accountAddress]: accountData }
          dispatch({ type: GET_ACCOUNT_DATA_OK, data });
          return resolve(accountData);
        }
        dispatch({ type: GET_ACCOUNT_DATA_FAIL, reason: er.toString() });
        return reject(er);
      });
    });
  }
}

/**
 * Get mint data
 */
export const GET_MINT_DATA = 'GET_MINT_DATA';
export const GET_MINT_DATA_OK = 'GET_MINT_DATA_OK';
export const GET_MINT_DATA_FAIL = 'GET_MINT_DATA_FAIL';

export const getMintData = (mintAddress, force = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_MINT_DATA });

      if (!ssjs.isAddress(mintAddress)) {
        const er = 'Invalid mint address';
        dispatch({ type: GET_MINT_DATA_FAIL, reason: er });
        return reject(er);
      }

      let { bucket: { [mintAddress]: mintData } } = getState();
      if (!mintData || force) {
        const { api: { base } } = configs;
        return window.senswap.splt.getMintData(mintAddress).then(re => {
          mintData = { ...re }
          return api.get(base + '/mint', { address: mintAddress });
        }).then(({ data: re }) => {
          mintData = { ...mintData, ...re }
          const data = { [mintAddress]: mintData }
          dispatch({ type: GET_MINT_DATA_OK, data });
          return resolve(mintData);
        }).catch(er => {
          dispatch({ type: GET_MINT_DATA_FAIL, reason: er.toString() });
          return reject(er);
        });
      } else {
        const data = { [mintAddress]: mintData };
        dispatch({ type: GET_MINT_DATA_OK, data });
        return resolve(mintData);
      }
    });
  }
}

/**
 * Get pool data
 */
export const GET_POOL_DATA = 'GET_POOL_DATA';
export const GET_POOL_DATA_OK = 'GET_POOL_DATA_OK';
export const GET_POOL_DATA_FAIL = 'GET_POOL_DATA_FAIL';

export const getPoolData = (poolAddress, force = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_POOL_DATA });

      if (!ssjs.isAddress(poolAddress)) {
        const er = 'Invalid pool address';
        dispatch({ type: GET_POOL_DATA_FAIL, reason: er });
        return reject(er);
      }

      let { bucket: { [poolAddress]: poolData } } = getState();
      if (poolData && !force) {
        const data = { [poolAddress]: poolData };
        dispatch({ type: GET_POOL_DATA_OK, data });
        return resolve(poolData);
      }

      const { api: { base } } = configs;
      return window.senswap.swap.getPoolData(poolAddress).then(re => {
        poolData = { ...re }
        return api.get(base + '/pool', { address: poolAddress });
      }).then(({ data: re }) => {
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
        return resolve(poolData);
      }).catch(er => {
        dispatch({ type: GET_POOL_DATA_FAIL, reason: er.toString() });
        return reject(er);
      });
    });
  }
}


/**
 * Set item
 */
export const SET_ITEM = 'SET_ITEM';
export const SET_ITEM_OK = 'SET_ITEM_OK';
export const SET_ITEM_FAIL = 'SET_ITEM_FAIL';

export const setItem = (value) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_ITEM });

      if (!value || !value.address) {
        const er = 'Invalid value';
        dispatch({ type: SET_ITEM_FAIL, reason: er });
        return reject(er);
      }

      const key = value.address;
      const data = { [key]: value }
      dispatch({ type: SET_ITEM_OK, data });
      return resolve(value);
    });
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
    case SET_ITEM_OK:
      return { ...state, ...action.data };
    case SET_ITEM_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}