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

export const getPool = (_id, force = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_POOL });

      let { pool: { [_id]: poolData } } = getState();
      if (!poolData || force) {
        const { api: { base } } = configs;
        return api.get(base + '/pool', { _id }).then(({ data: poolData }) => {
          const data = { [_id]: poolData }
          dispatch({ type: GET_POOL_OK, data });
          return resolve(poolData);
        }).catch(er => {
          dispatch({ type: GET_POOL_FAIL, reason: er.toString() });
          return reject(er.toString());
        });
      } else {
        const data = { [_id]: poolData }
        dispatch({ type: GET_POOL_OK, data });
        return resolve(poolData);
      }
    });
  }
}

/**
 * Get pools
 */
export const GET_POOLS = 'GET_POOLS';
export const GET_POOLS_OK = 'GET_POOLS_OK';
export const GET_POOLS_FAIL = 'GET_POOLS_FAIL';

export const getPools = (condition, limit, page) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: GET_POOLS });

      const { api: { base } } = configs;
      return api.get(base + '/pools', { condition, limit, page }).then(({ data }) => {
        dispatch({ type: GET_POOLS_OK, data: {} });
        return resolve(data);
      }).catch(er => {
        dispatch({ type: GET_POOLS_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Add a pool
 */
export const ADD_POOL = 'ADD_POOL';
export const ADD_POOL_OK = 'ADD_POOL_OK';
export const ADD_POOL_FAIL = 'ADD_POOL_FAIL';

export const addPool = (pool) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: ADD_POOL });

      const { api: { base } } = configs;
      return api.post(base + '/pool', { pool }).then(({ data: poolData }) => {
        const data = { [poolData._id]: poolData }
        dispatch({ type: ADD_POOL_OK, data });
        return resolve(poolData);
      }).catch(er => {
        dispatch({ type: ADD_POOL_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Update a pool
 */
export const UPDATE_POOL = 'UPDATE_POOL';
export const UPDATE_POOL_OK = 'UPDATE_POOL_OK';
export const UPDATE_POOL_FAIL = 'UPDATE_POOL_FAIL';

export const updatePool = (pool, secretKey) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: UPDATE_POOL });

      const { api: { base } } = configs;
      return api.put(base + '/pool', { pool }, secretKey).then(({ data: poolData }) => {
        const data = { [poolData._id]: poolData }
        dispatch({ type: UPDATE_POOL_OK, data });
        return resolve(poolData);
      }).catch(er => {
        dispatch({ type: UPDATE_POOL_FAIL, reason: er.toString() });
        return reject(er.toString());
      });
    });
  }
}

/**
 * Delete a pool
 */
export const DELETE_POOL = 'DELETE_POOL';
export const DELETE_POOL_OK = 'DELETE_POOL_OK';
export const DELETE_POOL_FAIL = 'DELETE_POOL_FAIL';

export const deletePool = (pool, secretKey) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: DELETE_POOL });

      const { api: { base } } = configs;
      return api.delete(base + '/pool', { pool }, secretKey).then(({ data: poolData }) => {
        const data = { [poolData._id]: null }
        dispatch({ type: DELETE_POOL_OK, data });
        return resolve(poolData);
      }).catch(er => {
        dispatch({ type: DELETE_POOL_FAIL, reason: er.toString() });
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