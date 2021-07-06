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
export const GET_STAKE_POOL = 'GET_STAKE_POOL';
export const GET_STAKE_POOL_OK = 'GET_STAKE_POOL_OK';
export const GET_STAKE_POOL_FAIL = 'GET_STAKE_POOL_FAIL';

export const getStakePool = (address, force = false) => {
  return async (dispatch, getState) => {
    dispatch({ type: GET_STAKE_POOL });

    let { stakePool: { [address]: stakePoolData } } = getState();
    if (stakePoolData && !force) {
      const data = { [address]: stakePoolData }
      dispatch({ type: GET_STAKE_POOL_OK, data });
      return stakePoolData;
    }

    const { api: { base } } = configs;
    try {
      const { data: stakePoolData } = await api.get(base + '/pool', { address });
      const data = { [address]: stakePoolData }
      dispatch({ type: GET_STAKE_POOL_OK, data });
      return stakePoolData;
    } catch (er) {
      dispatch({ type: GET_STAKE_POOL_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Get stake pools
 */
export const GET_STAKE_POOLS = 'GET_POOLS';
export const GET_STAKE_POOLS_OK = 'GET_POOLS_OK';
export const GET_STAKE_POOLS_FAIL = 'GET_POOLS_FAIL';

export const getStakePools = (condition, limit, page) => {
  return async dispatch => {
    dispatch({ type: GET_STAKE_POOLS });
    const { api: { base } } = configs;
    try {
      const { data } = await api.get(base + '/stake-pools', { condition, limit, page });
      const dataStore = {}
      
      for (const stakePool of data) {
        const {address} = stakePool;
        dataStore[address] = stakePool
      }
      dispatch({ type: GET_STAKE_POOLS_OK, data: dataStore });
      return data;
    } catch (er) {
      dispatch({ type: GET_STAKE_POOLS_FAIL, reason: er.toString() });
      throw new Error(er);
    }
  }
}

/**
 * Add a stake pool
 */
export const ADD_STAKE_POOL = 'ADD_STAKE_POOL';
export const ADD_STAKE_POOL_OK = 'ADD_STAKE_POOL_OK';
export const ADD_STAKE_POOL_FAIL = 'ADD_STAKE_POOL_FAIL';

export const addStakePool = (stakePool) => {
  return async dispatch => {
    dispatch({ type: ADD_STAKE_POOL });

    const { api: { base } } = configs;
    try {
      const { data: stakePoolData } = await api.post(base + '/stake-pool', { stakePool });
      const data = { [stakePoolData.address]: stakePoolData }
      dispatch({ type: ADD_STAKE_POOL_OK, data });
      return stakePoolData;
    } catch (er) {
      dispatch({ type: ADD_STAKE_POOL_FAIL, reason: er.toString() });
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
    case GET_STAKE_POOL_OK:
      return { ...state, ...action.data };
    case GET_STAKE_POOL_FAIL:
      return { ...state, ...action.data };
    case GET_STAKE_POOLS_OK:
      return { ...state, ...action.data };
    case GET_STAKE_POOLS_FAIL:
      return { ...state, ...action.data };
    case ADD_STAKE_POOL_OK:
      return { ...state, ...action.data };
    case ADD_STAKE_POOL_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}