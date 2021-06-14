import configs from 'configs';
import api from 'helpers/api';


/**
 * Documents
 * @default defaultData
 */
const defaultState = {}

/**
 * Get pool
 */
export const GET_POOL = 'GET_POOL';
export const GET_POOL_OK = 'GET_POOL_OK';
export const GET_POOL_FAIL = 'GET_POOL_FAIL';

export const getPool = (address, force = false) => {
  return async (dispatch, getState) => {
    dispatch({ type: GET_POOL });

    let { pool: { [address]: poolData } } = getState();
    if (poolData && !force) {
      const data = { [address]: poolData }
      dispatch({ type: GET_POOL_OK, data });
      return poolData;
    }

    const { api: { base } } = configs;
    try {
      const { data: poolData } = await api.get(base + '/pool', { address });
      const data = { [address]: poolData }
      dispatch({ type: GET_POOL_OK, data });
      return poolData;
    } catch (er) {
      dispatch({ type: GET_POOL_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Get pools
 */
export const GET_POOLS = 'GET_POOLS';
export const GET_POOLS_OK = 'GET_POOLS_OK';
export const GET_POOLS_FAIL = 'GET_POOLS_FAIL';

export const getPools = (condition, limit, page) => {
  return async dispatch => {
    dispatch({ type: GET_POOLS });

    const { api: { base } } = configs;
    try {
      const { data } = await api.get(base + '/pools', { condition, limit, page });
      dispatch({ type: GET_POOLS_OK, data: {} });
      return data;
    } catch (er) {
      dispatch({ type: GET_POOLS_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Add a pool
 */
export const ADD_POOL = 'ADD_POOL';
export const ADD_POOL_OK = 'ADD_POOL_OK';
export const ADD_POOL_FAIL = 'ADD_POOL_FAIL';

export const addPool = (pool) => {
  return async dispatch => {
    dispatch({ type: ADD_POOL });

    const { api: { base } } = configs;
    try {
      const { data: poolData } = await api.post(base + '/pool', { pool });
      const data = { [poolData.address]: poolData }
      dispatch({ type: ADD_POOL_OK, data });
      return poolData;
    } catch (er) {
      dispatch({ type: ADD_POOL_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Update a pool
 */
export const UPDATE_POOL = 'UPDATE_POOL';
export const UPDATE_POOL_OK = 'UPDATE_POOL_OK';
export const UPDATE_POOL_FAIL = 'UPDATE_POOL_FAIL';

export const updatePool = (pool) => {
  return async dispatch => {
    dispatch({ type: UPDATE_POOL });

    const { api: { base } } = configs;
    try {
      const { data: poolData } = await api.put(base + '/pool', { pool }, true);
      const data = { [poolData.address]: poolData }
      dispatch({ type: UPDATE_POOL_OK, data });
      return poolData;
    } catch (er) {
      dispatch({ type: UPDATE_POOL_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Delete a pool
 */
export const DELETE_POOL = 'DELETE_POOL';
export const DELETE_POOL_OK = 'DELETE_POOL_OK';
export const DELETE_POOL_FAIL = 'DELETE_POOL_FAIL';

export const deletePool = (pool) => {
  return async dispatch => {
    dispatch({ type: DELETE_POOL });

    const { api: { base } } = configs;
    try {
      const { data: poolData } = await api.delete(base + '/pool', { pool }, true);
      const data = { [poolData.address]: null }
      dispatch({ type: DELETE_POOL_OK, data });
      return poolData;
    } catch (er) {
      dispatch({ type: DELETE_POOL_FAIL, reason: er.toString() });
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
    case GET_POOL_OK:
      return { ...state, ...action.data };
    case GET_POOL_FAIL:
      return { ...state, ...action.data };
    case GET_POOLS_OK:
      return { ...state, ...action.data };
    case GET_POOLS_FAIL:
      return { ...state, ...action.data };
    case ADD_POOL_OK:
      return { ...state, ...action.data };
    case ADD_POOL_FAIL:
      return { ...state, ...action.data };
    case UPDATE_POOL_OK:
      return { ...state, ...action.data };
    case UPDATE_POOL_FAIL:
      return { ...state, ...action.data };
    case DELETE_POOL_OK:
      return { ...state, ...action.data };
    case DELETE_POOL_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}