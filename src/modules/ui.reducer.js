/**
 * Documents
 * @default defaultData
 */

const defaultState = {
  width: 0,
  type: 'xs',
  error: '',
  visible: false,
  loading: false,
  leftbar: window.innerWidth >= 600,
  rightbar: false,
}


/**
 * Responsive
 */
export const SET_SCREEN = 'SET_SCREEN';
export const SET_SCREEN_OK = 'SET_SCREEN_OK';
export const SET_SCREEN_FAIL = 'SET_SCREEN_FAIL';

const getCode = (value) => {
  if (value < 600)
    return 'xs';
  if (value < 960)
    return 'sm';
  if (value < 1280)
    return 'md';
  if (value < 1920)
    return 'lg';
  return 'xl';
}

export const setScreen = (width) => {
  return dispatch => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_SCREEN });

      if (typeof (width) !== 'number' || width < 0) {
        const er = 'Input is null';
        dispatch({ type: SET_SCREEN_FAIL, reason: er });
        return reject(er);
      }

      const data = { width, type: getCode(width) };
      dispatch({ type: SET_SCREEN_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Scroll
 */
export const SET_SCROLL = 'SET_SCROLL';
export const SET_SCROLL_OK = 'SET_SCROLL_OK';
export const SET_SCROLL_FAIL = 'SET_SCROLL_FAIL';

export const setScroll = (scrollY) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_SCROLL });

      if (typeof (scrollY) !== 'number' || scrollY < 0) {
        const er = 'Empty input';
        dispatch({ type: SET_SCROLL_FAIL, reason: er });
        return reject(er);
      }

      const { ui: { scrollY: prevScrollY } } = getState();
      const data = { scrollY, direction: prevScrollY > scrollY ? 'up' : 'down' };
      dispatch({ type: SET_SCROLL_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Notify errors
 */
export const SET_ERROR = 'SET_ERROR';
export const SET_ERROR_OK = 'SET_ERROR_OK';
export const SET_ERROR_FAIL = 'SET_ERROR_FAIL';

export const setError = (error) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_ERROR });

      if (!error) {
        const er = 'Empty input';
        dispatch({ type: SET_ERROR_FAIL, reason: er });
        return reject(er);
      }
      const { ui: { visible: prevVisible, error: prevError } } = getState();
      if (prevVisible && error === prevError) {
        const er = 'There exists another error needed to handle first';
        dispatch({ type: SET_ERROR_FAIL, reason: er });
        return reject(er);
      }

      console.log(typeof error)
      const data = {
        error: typeof error === 'object' ? JSON.stringify(error) : error.toString(),
        visible: true
      }
      dispatch({ type: SET_ERROR_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Turn off errors
 */
export const UNSET_ERROR = 'UNSET_ERROR';
export const UNSET_ERROR_OK = 'UNSET_ERROR_OK';
export const UNSET_ERROR_FAIL = 'UNSET_ERROR_FAIL';

export const unsetError = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: UNSET_ERROR });

      const { ui: { visible: prevVisible } } = getState();
      if (!prevVisible) {
        const er = 'There is no error';
        dispatch({ type: UNSET_ERROR_FAIL, reason: er });
        return reject(er);
      }

      const data = { error: '', visible: false }
      dispatch({ type: UNSET_ERROR_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Loading
 */
export const SET_LOADING = 'SET_LOADING';
export const SET_LOADING_OK = 'SET_LOADING_OK';
export const SET_LOADING_FAIL = 'SET_LOADING_FAIL';

export const setLoading = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: SET_LOADING });

      const { ui: { loading: prevLoading } } = getState();
      if (prevLoading) {
        const er = 'Already loading';
        dispatch({ type: SET_LOADING_FAIL, reason: er });
        return reject(er);
      }

      const data = { loading: true }
      dispatch({ type: SET_LOADING_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Unloading
 */
export const UNSET_LOADING = 'UNSET_LOADING';
export const UNSET_LOADING_OK = 'UNSET_LOADING_OK';
export const UNSET_LOADING_FAIL = 'UNSET_LOADING_FAIL';

export const unsetLoading = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: UNSET_LOADING });

      const { ui: { loading: prevLoading } } = getState();
      if (!prevLoading) {
        const er = 'Already unloading';
        dispatch({ type: UNSET_LOADING_FAIL, reason: er });
        return reject(er);
      }

      const data = { loading: false }
      dispatch({ type: UNSET_LOADING_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Toggle leftbar
 */
export const TOGGLE_LEFT_BAR = 'TOOGLE_LEFT_BAR';
export const TOGGLE_LEFT_BAR_OK = 'TOGGLE_LEFT_BAR_OK';
export const TOGGLE_LEFT_BAR_FAIL = 'TOGGLE_LEFT_BAR_FAIL';

export const toggleLeftBar = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: TOGGLE_LEFT_BAR });

      const { ui: { leftbar: prevLeftbar } } = getState();

      const data = { leftbar: !prevLeftbar }
      dispatch({ type: TOGGLE_LEFT_BAR_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Toggle rightbar
 */
export const TOGGLE_RIGHT_BAR = 'TOOGLE_RIGHT_BAR';
export const TOGGLE_RIGHT_BAR_OK = 'TOGGLE_RIGHT_BAR_OK';
export const TOGGLE_RIGHT_BAR_FAIL = 'TOGGLE_RIGHT_BAR_FAIL';

export const toggleRightBar = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: TOGGLE_RIGHT_BAR });

      const { ui: { rightbar: prevRightbar } } = getState();

      const data = { rightbar: !prevRightbar }
      dispatch({ type: TOGGLE_RIGHT_BAR_OK, data });
      return resolve(data);
    });
  }
}

/**
 * Reducder
 */
// eslint-disable-next-line
export default (state = defaultState, action) => {
  switch (action.type) {
    case SET_SCREEN_OK:
      return { ...state, ...action.data };
    case SET_SCREEN_FAIL:
      return { ...state, ...action.data };
    case SET_SCROLL_OK:
      return { ...state, ...action.data };
    case SET_SCROLL_FAIL:
      return { ...state, ...action.data };
    case SET_ERROR_OK:
      return { ...state, ...action.data };
    case SET_ERROR_FAIL:
      return { ...state, ...action.data };
    case UNSET_ERROR_OK:
      return { ...state, ...action.data };
    case UNSET_ERROR_FAIL:
      return { ...state, ...action.data };
    case SET_LOADING_OK:
      return { ...state, ...action.data };
    case SET_LOADING_FAIL:
      return { ...state, ...action.data };
    case UNSET_LOADING_OK:
      return { ...state, ...action.data };
    case UNSET_LOADING_FAIL:
      return { ...state, ...action.data };
    case TOGGLE_LEFT_BAR_OK:
      return { ...state, ...action.data };
    case TOGGLE_LEFT_BAR_FAIL:
      return { ...state, ...action.data };
    case TOGGLE_RIGHT_BAR_OK:
      return { ...state, ...action.data };
    case TOGGLE_RIGHT_BAR_FAIL:
      return { ...state, ...action.data };
    default:
      return state;
  }
}