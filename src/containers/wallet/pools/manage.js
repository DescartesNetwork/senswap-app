import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';

import { CloseRounded, SettingsRounded, RemoveRounded } from '@material-ui/icons';

import Drain from 'components/drain';

import styles from './styles';
import sol from 'helpers/sol';
import { updatePool } from 'modules/wallet.reducer';


class Manage extends Component {
  constructor() {
    super();

    this.state = {
      visible: false,
      pool: '',
      loading: false,
      error: '',
      data: {},
      values: []
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(wallet, prevWallet)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { pools } } = this.props;
    return Promise.all(pools.map(pool => {
      return sol.getPoolAccountData(pool);
    })).then(values => {
      return this.setState({ values });
    }).catch(er => {
      return console.error(er);
    });
  }

  onPool = (e) => {
    const pool = e.target.value || '';
    return this.setState({ pool, loading: true, error: '' }, () => {
      if (pool.length !== 44) return this.setState({ loading: false, data: {}, error: 'Invalid address length' });
      return sol.getPoolAccountData(pool).then(data => {
        return this.setState({ loading: false, data, error: '' });
      }).catch(er => {
        return this.setState({ loading: false, data: {}, error: er });
      })
    });
  }

  addPool = () => {
    const { pool, loading, error } = this.state;
    if (loading) return this.setState({ error: 'Validating pool' });
    if (error) return this.setState({ error });
    if (!pool) return this.setState({ error: 'Empty pool' });
    const { wallet: { pools }, updatePool } = this.props;
    const newPools = [...pools];
    newPools.push(pool);
    return updatePool(newPools).then(re => {
      return this.setState({ loading: false, data: {}, error: '', pool: '' });
    }).catch(er => {
      return this.setState({ error: er });
    });
  }

  removePool = (address) => {
    const { wallet: { pools }, updatePool } = this.props;
    const newPools = pools.filter(pool => pool !== address);
    return updatePool(newPools);
  }

  onClose = () => {
    return this.setState({ visible: false });
  }

  onOpen = () => {
    return this.setState({ visible: true });
  }

  renderPoolInfo = () => {
    const { data: { token, treasury, reserve, sen, fee_numerator, fee_denominator } } = this.state;
    if (!token) return null;
    return <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label='Token'
          variant="outlined"
          color="primary"
          value={token}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Treasury"
          variant="outlined"
          color="primary"
          value={treasury}
          helperText={reserve.toString()}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Price"
          variant="outlined"
          color="primary"
          value={Number(sen) / Number(reserve)}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Fee"
          variant="outlined"
          color="primary"
          value={Number(fee_numerator) / Number(fee_denominator)}
          fullWidth
        />
      </Grid>
    </Grid>
  }

  renderPoolList = () => {
    const { wallet: { pools } } = this.props;
    const { values } = this.state;
    return <Grid container spacing={2}>
      {values.map((value, index) => {
        const address = pools[index];
        if (!address) return null;
        const token = value.token;
        const treasury = value.treasury;
        const reserve = value.reserve.toString();
        const price = (Number(value.sen) / Number(value.reserve)).toString();
        const fee = (Number(value.fee_numerator) / Number(value.fee_denominator)).toString();

        return <Grid key={address} item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Pool"
                variant="outlined"
                color="primary"
                value={address}
                helperText={token}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Balance"
                variant="outlined"
                color="primary"
                value={treasury}
                helperText={`Reserve: ${reserve} - Price: ${price} - Fee: ${fee}`}
                InputProps={{
                  endAdornment: <IconButton color="secondary" onClick={() => this.removePool(address)}>
                    <RemoveRounded />
                  </IconButton>
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Grid>
      })}
    </Grid>
  }

  render() {
    const { classes } = this.props;
    const { visible, loading, pool, error } = this.state;

    return <Fragment>
      <Tooltip title="Add/Remove your pool accounts">
        <IconButton onClick={this.onOpen} size="small" color="primary">
          <SettingsRounded />
        </IconButton>
      </Tooltip>
      <Dialog open={visible} onClose={this.onClose}>
        <DialogTitle>
          <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
            <Grid item className={classes.stretch}>
              <Typography variant="h6">Manage your pool accounts</Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={this.onClose}>
                <CloseRounded />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>

            <Grid item xs={12}>
              {this.renderPoolList()}
            </Grid>

            <Grid item xs={12}>
              <Drain small />
            </Grid>

            <Grid item xs={12}>
              <Grid container className={classes.noWrap} alignItems="center" spacing={2}>
                <Grid item className={classes.stretch}>
                  <TextField
                    label="Add a pool saccount"
                    variant="outlined"
                    color="primary"
                    onChange={this.onPool}
                    value={pool}
                    error={Boolean(error)}
                    helperText={error}
                    InputProps={{
                      endAdornment: loading ? <CircularProgress size={16} /> : null
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item>
                  <Button color="primary" onClick={this.addPool} size="large">
                    <Typography>OK</Typography>
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              {this.renderPoolInfo()}
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          {/* Nothing */}
        </DialogActions>
      </Dialog>
    </Fragment>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  updatePool
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Manage)));