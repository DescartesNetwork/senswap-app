import configs from 'configs';
import api from 'helpers/api';


/**
 * Documents
 * @default defaultData
 */
const defaultState = {
  txId: '',
  tokens: []
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
        dispatch({ type: GET_WHITELIST_OK, data });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_WHITELIST_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}


/**
 * Airdrop
 */
export const AIRDROP = 'AIRDROP';
export const AIRDROP_OK = 'AIRDROP_OK';
export const AIRDROP_FAIL = 'AIRDROP_FAIL';

export const airdrop = (dstAddress, tokenAddress) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: AIRDROP });

      if (!dstAddress || !tokenAddress) {
        const er = 'Invalid input';
        dispatch({ type: AIRDROP_FAIL, reason: er });
        return reject(er);
      }

      const { api: { base } } = configs;
      return api.post(base + '/faucet', { dstAddress, tokenAddress }).then(({ data }) => {
        dispatch({ type: AIRDROP_OK, data });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: AIRDROP_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Reducder
 */
export default (state = defaultState, action) => {
  switch (action.type) {
    case GET_WHITELIST_OK:
      return { ...state, ...action.data };
    case GET_WHITELIST_FAIL:
      return { ...state, ...action.data };
    case AIRDROP_OK:
      return { ...state, ...action.data };
    case AIRDROP_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}