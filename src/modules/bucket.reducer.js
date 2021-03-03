import ssjs from 'senswapjs';

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

      const { bucket: { [accountAddress]: accountData } } = getState();
      if (!accountData || force) {
        return window.senwallet.splt.getAccountData(accountAddress).then(re => {
          const data = { [accountAddress]: re }
          dispatch({ type: GET_ACCOUNT_DATA_OK, data });
          return resolve(re);
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

      const { bucket: { [mintAddress]: mintData } } = getState();
      if (!mintData || force) {
        return window.senwallet.splt.getMintData(mintAddress).then(re => {
          const data = { [mintAddress]: re }
          dispatch({ type: GET_MINT_DATA_OK, data });
          return resolve(re);
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

      const { bucket: { [poolAddress]: poolData } } = getState();
      if (!poolData || force) {
        return window.senwallet.swap.getPoolData(poolAddress).then(re => {
          const data = { [poolAddress]: re }
          dispatch({ type: GET_POOL_DATA_OK, data });
          return resolve(re);
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

      const { bucket: { [lptAddress]: lptData } } = getState();
      if (!lptData || force) {
        return window.senwallet.swap.getLPTData(lptAddress).then(re => {
          const data = { [lptAddress]: re }
          dispatch({ type: GET_LPT_DATA_OK, data });
          return resolve(re);
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