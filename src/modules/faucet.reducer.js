import ssjs from 'senswapjs';
import configs from 'configs';
import api from 'helpers/api';


/**
 * Documents
 * @default defaultData
 */
const defaultState = {
  txId: '',
  mints: []
}

/**
 * Get tokens
 */
export const GET_WHITELIST = 'GET_WHITELIST';
export const GET_WHITELIST_OK = 'GET_WHITELIST_OK';
export const GET_WHITELIST_FAIL = 'GET_WHITELIST_FAIL';

export const getWhiteList = () => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_WHITELIST });

      const { api: { base } } = configs;
      return api.get(base + '/faucet').then(({ data }) => {
        dispatch({ type: GET_WHITELIST_OK, data: { mints: data } });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_WHITELIST_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Airdrop lamports
 */
export const AIRDROP_LAMPORTS = 'AIRDROP_LAMPORTS';
export const AIRDROP_LAMPORTS_OK = 'AIRDROP_LAMPORTS_OK';
export const AIRDROP_LAMPORTS_FAIL = 'AIRDROP_LAMPORTS_FAIL';

export const airdropLamports = (dstAddress) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: AIRDROP_LAMPORTS });

      if (!ssjs.isAddress(dstAddress)) {
        const er = 'Invalid input';
        dispatch({ type: AIRDROP_LAMPORTS_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.post(base + '/faucet/fund', { dstAddress }).then(({ data }) => {
        dispatch({ type: AIRDROP_LAMPORTS_OK, data });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: AIRDROP_LAMPORTS_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Airdrop tokens
 */
export const AIRDROP_TOKENS = 'AIRDROP_TOKENS';
export const AIRDROP_TOKENS_OK = 'AIRDROP_TOKENS_OK';
export const AIRDROP_TOKENS_FAIL = 'AIRDROP_TOKENS_FAIL';

export const airdropTokens = (dstAddress, mintAddress) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: AIRDROP_TOKENS });

      if (!ssjs.isAddress(dstAddress) || !ssjs.isAddress(mintAddress)) {
        const er = 'Invalid input';
        dispatch({ type: AIRDROP_TOKENS_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.post(base + '/faucet/airdrop', { dstAddress, mintAddress }).then(({ data }) => {
        dispatch({ type: AIRDROP_TOKENS_OK, data });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: AIRDROP_TOKENS_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Reducder
 */
// eslint-disable-next-line
export default (state = defaultState, action) => {
  switch (action.type) {
    case GET_WHITELIST_OK:
      return { ...state, ...action.data };
    case GET_WHITELIST_FAIL:
      return { ...state, ...action.data };
    case AIRDROP_LAMPORTS_OK:
      return { ...state, ...action.data };
    case AIRDROP_LAMPORTS_FAIL:
      return { ...state, ...action.data };
    case AIRDROP_TOKENS_OK:
      return { ...state, ...action.data };
    case AIRDROP_TOKENS_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}