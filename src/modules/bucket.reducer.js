import ssjs from 'senswapjs';

import configs from 'configs';
import api from 'helpers/api';

/**
 * Documents
 * @default defaultData
 */
const defaultState = {}


/**
 * Get network data
 */
export const GET_NETWORK_DATA = 'GET_NETWORK_DATA';
export const GET_NETWORK_DATA_OK = 'GET_NETWORK_DATA_OK';
export const GET_NETWORK_DATA_FAIL = 'GET_NETWORK_DATA_FAIL';

export const getNetworkData = (networkAddress, force = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_NETWORK_DATA });

      if (!ssjs.isAddress(networkAddress)) {
        const er = 'Invalid network address';
        dispatch({ type: GET_NETWORK_DATA_FAIL, reason: er });
        return reject(er);
      }

      let { bucket: { [networkAddress]: networkData } } = getState();
      if (!networkData || force) {
        return window.senwallet.swap.getNetworkData(networkAddress).then(re => {
          networkData = { ...re }
          const data = { [networkAddress]: networkData }
          dispatch({ type: GET_NETWORK_DATA_OK, data });
          return resolve(networkData);
        }).catch(er => {
          dispatch({ type: GET_NETWORK_DATA_FAIL, reason: er.toString() });
          return reject(er);
        });
      } else {
        const data = { [networkAddress]: networkData }
        dispatch({ type: GET_NETWORK_DATA_OK, data });
        return resolve(networkData);
      }
    });
  }
}

/**
 * Get DAO data
 */
export const GET_DAO_DATA = 'GET_DAO_DATA';
export const GET_DAO_DATA_OK = 'GET_DAO_DATA_OK';
export const GET_DAO_DATA_FAIL = 'GET_DAO_DATA_FAIL';

export const getDAOData = (daoAddress, force = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_DAO_DATA });

      if (!ssjs.isAddress(daoAddress)) {
        const er = 'Invalid DAO address';
        dispatch({ type: GET_DAO_DATA_FAIL, reason: er });
        return reject(er);
      }

      let { bucket: { [daoAddress]: daoData } } = getState();
      if (!daoData || force) {
        return window.senwallet.swap.getDAOData(daoAddress).then(re => {
          daoData = { ...re }
          const data = { [daoAddress]: daoData }
          dispatch({ type: GET_DAO_DATA_OK, data });
          return resolve(daoData);
        }).catch(er => {
          dispatch({ type: GET_DAO_DATA_FAIL, reason: er.toString() });
          return reject(er);
        });
      } else {
        const data = { [daoAddress]: daoData }
        dispatch({ type: GET_DAO_DATA_OK, data });
        return resolve(daoData);
      }
    });
  }
}

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
      if (!accountData || force) {
        const { api: { base } } = configs;
        return window.senwallet.splt.getAccountData(accountAddress).then(re => {
          accountData = { ...re }
          const condition = { address: re.mint.address }
          return api.get(base + '/mints', { condition });
        }).then(({ data: [re] }) => {
          if (!re) return Promise.resolve({ data: {} });
          return api.get(base + '/mint', { _id: re._id });
        }).then(({ data: re }) => {
          accountData.mint = { ...accountData.mint, ...re }
          const data = { [accountAddress]: accountData }
          dispatch({ type: GET_ACCOUNT_DATA_OK, data });
          return resolve(accountData);
        }).catch(er => {
          dispatch({ type: GET_ACCOUNT_DATA_FAIL, reason: er.toString() });
          return reject(er);
        });
      } else {
        const data = { [accountAddress]: accountData }
        dispatch({ type: GET_ACCOUNT_DATA_OK, data });
        return resolve(accountData);
      }
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
        return window.senwallet.splt.getMintData(mintAddress).then(re => {
          mintData = { ...re }
          const condition = { address: re.address }
          return api.get(base + '/mints', { condition });
        }).then(({ data: [re] }) => {
          if (!re) return Promise.resolve({ data: {} });
          return api.get(base + '/mint', { _id: re._id });
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
      if (!poolData || force) {
        const { api: { base } } = configs;
        return window.senwallet.swap.getPoolData(poolAddress).then(re => {
          poolData = { ...re }
          const condition = { address: re.address }
          return api.get(base + '/pools', { condition });
        }).then(({ data: [re] }) => {
          if (!re) return Promise.resolve({ data: {} });
          return api.get(base + '/pool', { _id: re._id });
        }).then(({ data: re }) => {
          poolData = { ...re, ...poolData }
          const condition = { address: poolData.mint.address }
          return api.get(base + '/mints', { condition });
        }).then(({ data: [re] }) => {
          if (!re) return Promise.resolve({ data: {} });
          return api.get(base + '/mint', { _id: re._id });
        }).then(({ data: re }) => {
          poolData.mint = { ...poolData.mint, ...re }
          const data = { [poolAddress]: poolData }
          dispatch({ type: GET_POOL_DATA_OK, data });
          return resolve(poolData);
        }).catch(er => {
          dispatch({ type: GET_POOL_DATA_FAIL, reason: er.toString() });
          return reject(er);
        });
      } else {
        const data = { [poolAddress]: poolData };
        dispatch({ type: GET_POOL_DATA_OK, data });
        return resolve(poolData);
      }
    });
  }
}

/**
 * Get pool data
 */
export const GET_LPT_DATA = 'GET_LPT_DATA';
export const GET_LPT_DATA_OK = 'GET_LPT_DATA_OK';
export const GET_LPT_DATA_FAIL = 'GET_LPT_DATA_FAIL';

export const getLPTData = (lptAddress, force = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_LPT_DATA });

      if (!ssjs.isAddress(lptAddress)) {
        const er = 'Invalid LPT address';
        dispatch({ type: GET_LPT_DATA_FAIL, reason: er });
        return reject(er);
      }

      let { bucket: { [lptAddress]: lptData } } = getState();
      if (!lptData || force) {
        const { api: { base } } = configs;
        return window.senwallet.swap.getLPTData(lptAddress).then(re => {
          lptData = { ...re }
          const condition = { address: re.pool.address }
          return api.get(base + '/pools', { condition });
        }).then(({ data: [re] }) => {
          if (!re) return Promise.resolve({ data: {} });
          return api.get(base + '/pool', { _id: re._id });
        }).then(({ data: re }) => {
          lptData.pool = { ...re, ...lptData.pool }
          const condition = { address: lptData.pool.mint.address }
          return api.get(base + '/mints', { condition });
        }).then(({ data: [re] }) => {
          if (!re) return Promise.resolve({ data: {} });
          return api.get(base + '/mint', { _id: re._id });
        }).then(({ data: re }) => {
          lptData.pool.mint = { ...lptData.pool.mint, ...re }
          const data = { [lptAddress]: lptData }
          dispatch({ type: GET_LPT_DATA_OK, data });
          return resolve(lptData);
        }).catch(er => {
          dispatch({ type: GET_LPT_DATA_FAIL, reason: er.toString() });
          return reject(er);
        });
      } else {
        const data = { [lptAddress]: lptData };
        dispatch({ type: GET_LPT_DATA_OK, data });
        return resolve(lptData);
      }
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
export default (state = defaultState, action) => {
  switch (action.type) {
    case GET_NETWORK_DATA_OK:
      return { ...state, ...action.data };
    case GET_NETWORK_DATA_FAIL:
      return { ...state, ...action.data };
    case GET_DAO_DATA_OK:
      return { ...state, ...action.data };
    case GET_DAO_DATA_FAIL:
      return { ...state, ...action.data };
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
    case GET_LPT_DATA_OK:
      return { ...state, ...action.data };
    case GET_LPT_DATA_FAIL:
      return { ...state, ...action.data };
    case SET_ITEM_OK:
      return { ...state, ...action.data };
    case SET_ITEM_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}