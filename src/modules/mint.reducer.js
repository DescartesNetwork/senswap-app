import configs from 'configs';
import api from 'helpers/api';


/**
 * Documents
 * @default defaultData
 */
const defaultState = {}

/**
 * Get mint
 */
export const GET_MINT = 'GET_MINT';
export const GET_MINT_OK = 'GET_MINT_OK';
export const GET_MINT_FAIL = 'GET_MINT_FAIL';

export const getMint = (address, force = false) => {
  return async (dispatch, getState) => {
    dispatch({ type: GET_MINT });

    let { mint: { [address]: mintData } } = getState();
    if (mintData && !force) {
      const data = { [address]: mintData }
      dispatch({ type: GET_MINT_OK, data });
      return mintData;
    }
    
    const { api: { base } } = configs;
    try {
      const { data: mintData } = await api.get(base + '/mint', { address });
      const data = { [address]: mintData }
      dispatch({ type: GET_MINT_OK, data });
      return mintData;
    } catch (er) {
      dispatch({ type: GET_MINT_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Get mints
 */
export const GET_MINTS = 'GET_MINTS';
export const GET_MINTS_OK = 'GET_MINTS_OK';
export const GET_MINTS_FAIL = 'GET_MINTS_FAIL';

export const getMints = (condition, limit, page) => {
  return async dispatch => {
    dispatch({ type: GET_MINTS });

    const { api: { base } } = configs;
    try {
      const { data } = await api.get(base + '/mints', { condition, limit, page });
      dispatch({ type: GET_MINTS_OK, data: {} });
      return data;
    } catch (er) {
      dispatch({ type: GET_MINTS_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Add a mint
 */
export const ADD_MINT = 'ADD_MINT';
export const ADD_MINT_OK = 'ADD_MINT_OK';
export const ADD_MINT_FAIL = 'ADD_MINT_FAIL';

export const addMint = (mint) => {
  return async dispatch => {
    dispatch({ type: ADD_MINT });

    if (!mint) {
      const er = 'Invalid mint data';
      dispatch({ type: ADD_MINT_FAIL, reason: er });
      throw new Error(er);
    }

    const { api: { base } } = configs;
    try {
      const { data: mintData } = await api.post(base + '/mint', { mint }, true);
      const data = { [mintData.address]: mintData }
      dispatch({ type: ADD_MINT_OK, data });
      return mintData;
    } catch (er) {
      dispatch({ type: ADD_MINT_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Update a mint
 */
export const UPDATE_MINT = 'UPDATE_MINT';
export const UPDATE_MINT_OK = 'UPDATE_MINT_OK';
export const UPDATE_MINT_FAIL = 'UPDATE_MINT_FAIL';

export const updateMint = (mint) => {
  return async dispatch => {
    dispatch({ type: UPDATE_MINT });

    if (!mint) {
      const er = 'Invalid mint data';
      dispatch({ type: ADD_MINT_FAIL, reason: er });
      throw new Error(er);
    }

    const { api: { base } } = configs;
    try {
      const { data: mintData } = await api.put(base + '/mint', { mint }, true);
      const data = { [mintData.address]: mintData }
      dispatch({ type: UPDATE_MINT_OK, data });
      return mintData;
    } catch (er) {
      dispatch({ type: UPDATE_MINT_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Delete a mint
 */
export const DELETE_MINT = 'DELETE_MINT';
export const DELETE_MINT_OK = 'DELETE_MINT_OK';
export const DELETE_MINT_FAIL = 'DELETE_MINT_FAIL';

export const deleteMint = (mint) => {
  return async dispatch => {
    dispatch({ type: DELETE_MINT });

    if (!mint) {
      const er = 'Invalid mint data';
      dispatch({ type: DELETE_MINT_FAIL, reason: er });
      throw new Error(er);
    }

    const { api: { base } } = configs;
    try {
      const { data: mintData } = await api.delete(base + '/mint', { mint }, true);
      const data = { [mintData.address]: null }
      dispatch({ type: DELETE_MINT_OK, data });
      return mintData;
    } catch (er) {
      dispatch({ type: DELETE_MINT_FAIL, reason: er.toString() });
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
    case GET_MINT_OK:
      return { ...state, ...action.data };
    case GET_MINT_FAIL:
      return { ...state, ...action.data };
    case GET_MINTS_OK:
      return { ...state, ...action.data };
    case GET_MINTS_FAIL:
      return { ...state, ...action.data };
    case ADD_MINT_OK:
      return { ...state, ...action.data };
    case ADD_MINT_FAIL:
      return { ...state, ...action.data };
    case UPDATE_MINT_OK:
      return { ...state, ...action.data };
    case UPDATE_MINT_FAIL:
      return { ...state, ...action.data };
    case DELETE_MINT_OK:
      return { ...state, ...action.data };
    case DELETE_MINT_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}