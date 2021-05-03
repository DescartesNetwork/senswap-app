import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';

import TextField from '@material-ui/core/TextField';

import { DeleteForeverRounded, VerifiedUserRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';
import PoolList from './poolList';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { unlockWallet } from 'modules/wallet.reducer';
import { updatePool, deletePool } from 'modules/pool.reducer';
import { getPoolData } from 'modules/bucket.reducer';


const EMPTY = {
  loading: false,
  done: false
}

class VerifyPool extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      data: {},
    }
  }

  onData = (data) => {
    return this.setState({ data });
  }

  onAddress = (e) => {
    const address = e.target.value || '';
    const { data } = this.state;
    return this.setState({ data: { ...data, address } });
  }

  onUpdate = () => {
    const { updatePool, unlockWallet, getPoolData, setError } = this.props;
    const { data } = this.state;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(secretKey => {
        const pool = {
          _id: data._id,
          address: data.address,
          verified: !data.verified,
        }
        return updatePool(pool, secretKey);
      }).then(re => {
        return getPoolData(data.address, true);
      }).then(re => {
        return this.setState({ ...EMPTY, done: true });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  onDelete = () => {
    const { deletePool, unlockWallet, setError } = this.props;
    const { data } = this.state;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(secretKey => {
        const pool = { _id: data._id }
        return deletePool(pool, secretKey);
      }).then(re => {
        return this.setState({ ...EMPTY, done: true });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { data, loading, done } = this.state;
    const mint = data.mint || {}

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Pool selection</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          label={(mint.name || 'Unknown') + ' / ' + (mint.symbol || 'Unknown')}
          InputProps={{
            startAdornment: <MintAvatar
              icon={mint.icon}
              title={mint.name}
              marginRight
            />,
            endAdornment: <PoolList onChange={this.onData} />
          }}
          value={data.address || ''}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">Pool info</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          label="Pool address"
          value={data.address || ''}
          onChange={this.onAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          variant="outlined"
          label="Decimals"
          value={mint.decimals || 0}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          variant="outlined"
          label="Fee (%)"
          value={ssjs.undecimalize(data.fee, mint.decimals) * 100}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          variant="outlined"
          label="Reserve"
          value={utils.prettyNumber(ssjs.undecimalize(data.reserve, mint.decimals))}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          variant="outlined"
          label="LPT"
          value={utils.prettyNumber(ssjs.undecimalize(data.lpt, 9))}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems="flex-end" className={classes.noWrap} spacing={2}>
          <Grid item className={classes.stretch}>
            {done ? <Typography variant="body2">Done!</Typography> : null}
          </Grid>
          <Grid item>
            <Button
              onClick={this.onDelete}
              endIcon={<DeleteForeverRounded />}
              disabled={loading}
            >
              <Typography>Delete</Typography>
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              endIcon={loading ? <CircularProgress size={17} /> : <VerifiedUserRounded />}
              disabled={loading || done}
              onClick={this.onUpdate}
            >
              <Typography>{data.verified ? 'Unverify' : 'Verify'}</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  pool: state.pool,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  unlockWallet,
  updatePool, deletePool,
  getPoolData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(VerifyPool)));