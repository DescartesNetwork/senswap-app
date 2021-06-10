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
  return async dispatch => {
    dispatch({ type: GET_WHITELIST });

    const { api: { base } } = configs;
    try {
      const { data } = await api.get(base + '/faucet');
      dispatch({ type: GET_WHITELIST_OK, data: { mints: data } });
      return data;
    } catch (er) {
      dispatch({ type: GET_WHITELIST_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Airdrop tokens
 */
export const AIRDROP_TOKENS = 'AIRDROP_TOKENS';
export const AIRDROP_TOKENS_OK = 'AIRDROP_TOKENS_OK';
export const AIRDROP_TOKENS_FAIL = 'AIRDROP_TOKENS_FAIL';

export const airdropTokens = (dstAddress, mintAddress) => {
  return async dispatch => {
    dispatch({ type: AIRDROP_TOKENS });

    if (!ssjs.isAddress(dstAddress) || !ssjs.isAddress(mintAddress)) {
      const er = 'Invalid input';
      dispatch({ type: AIRDROP_TOKENS_FAIL, reason: er });
      throw new Error(er);
    }

    try {
      const { api: { base } } = configs;
      const { data } = await api.post(base + '/faucet/airdrop', { dstAddress, mintAddress });
      dispatch({ type: AIRDROP_TOKENS_OK, data });
      return data;
    } catch (er) {
      dispatch({ type: AIRDROP_TOKENS_FAIL, reason: er.toString() });
      throw new Error(er);
    }
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
    case AIRDROP_TOKENS_OK:
      return { ...state, ...action.data };
    case AIRDROP_TOKENS_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}