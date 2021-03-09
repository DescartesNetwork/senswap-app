import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import { DeleteForeverRounded, VerifiedUserRounded } from '@material-ui/icons';

import Ban from 'components/ban';
import MintAvatar from 'containers/wallet/components/mintAvatar';
import PoolList from './poolList';

import styles from './styles';
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

  onAuthor = (e) => {
    const author = e.target.value || '';
    const { data } = this.state;
    return this.setState({ data: { ...data, author } });
  }

  onUpdate = () => {
    const { updatePool, unlockWallet, getPoolData, setError } = this.props;
    const { data } = this.state;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(secretKey => {
        const pool = {
          _id: data._id,
          address: data.address,
          author: data.author,
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

  }

  render() {
    const { classes } = this.props;
    const { wallet: { user: { role } } } = this.props;
    const { data, loading, done } = this.state;
    const mint = data.mint || {}

    if (!['admin', 'operator'].includes(role)) return <Ban />
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
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          label="Author"
          value={data.author || ''}
          onChange={this.onAuthor}
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
          value={ssjs.div(data.fee_numerator, data.fee_denominator) * 100}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          variant="outlined"
          label="Reserve"
          value={(data.reserve || '').toString()}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          variant="outlined"
          label="LPT"
          value={(data.lpt || '').toString()}
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