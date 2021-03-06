import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import ui from './ui.reducer';
import wallet from './wallet.reducer';
import faucet from './faucet.reducer';
import pool from './pool.reducer';
import bucket from './bucket.reducer';
import mint from './mint.reducer';

export default (history) => combineReducers({
  router: connectRouter(history),
  ui,
  wallet,
  faucet,
  pool,
  bucket,
  mint,
});