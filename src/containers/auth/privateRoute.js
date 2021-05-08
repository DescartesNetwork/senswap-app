import React from 'react';
import { useStore } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import ssjs from 'senswapjs';

import configs from 'configs';

const PrivateRoute = ({ skipRole, component: Component, ...others }) => {
  const store = useStore();
  const { wallet: { user: { address, role } } } = store.getState();
  const { basics: { permission } } = configs;
  const isAuthorized = skipRole || permission.includes(role);
  const isLogged = ssjs.isAddress(address) && isAuthorized;
  return <Route {...others} render={props => isLogged ? <Component {...props} /> :
    <Redirect to={{ pathname: '/home', state: { from: props.location } }} />}
  />
}

export default PrivateRoute;