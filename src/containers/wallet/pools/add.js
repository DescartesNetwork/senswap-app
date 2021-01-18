import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import { AddRounded, CloseRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { updateWallet } from 'modules/wallet.reducer';


class Add extends Component {
  constructor() {
    super();

    this.state = {
      visible: false,
      loading: false,
      lptAccount: '',
      data: {},
    }
  }

  fetchData = () => {
    const { lptAccount } = this.state;
    return this.setState({ loading: true }, () => {
      if (!sol.isAddress(lptAccount)) return this.setState({ loading: false });
      return sol.getPoolData(lptAccount).then(data => {
        return this.setState({ loading: false, data });
      }).catch(er => {
        console.error(er);
        return this.setState({ loading: false });
      });
    });
  }

  onOpen = () => {
    return this.setState({ visible: true }, this.fetchData);
  }

  onClose = () => {
    return this.setState({ visible: false });
  }

  onAddress = (e) => {
    const lptAccount = e.target.value || '';
    return this.setState({ lptAccount }, this.fetchData);
  }

  onAdd = () => {
    const { lptAccount } = this.state;
    const { wallet: { user }, updateWallet } = this.props;
    if (user.lptAccounts.includes(lptAccount)) return;
    const lptAccounts = [...user.lptAccounts];
    lptAccounts.push(lptAccount);
    return updateWallet({ ...user, lptAccounts }).then(re => {
      return this.onClose();
    }).catch(er => {
      return console.error(er);
    });
  }

  renderInfo = () => {
    const { data: { initialized } } = this.state;
    if (!initialized) return null;

    const { data: {
      lpt,
      pool: {
        address: poolAddress,
        fee_numerator,
        fee_denominator,
        reserve: poolReserve,
        lpt: poolLPT,
        token,
        treasury
      }
    } } = this.state;
    const symbol = sol.toSymbol(token.symbol);
    const totalSupply = utils.prettyNumber(utils.div(token.total_supply, global.BigInt(10 ** token.decimals)));
    const lptAmount = utils.prettyNumber(utils.div(lpt, global.BigInt(10 ** token.decimals)));
    const price = utils.div(poolLPT, poolReserve);
    const fee = utils.div(fee_numerator, fee_denominator) * 100;
    const reserve = utils.prettyNumber(utils.div(poolReserve, global.BigInt(10 ** token.decimals)));

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField label="LPT" variant="outlined" value={lptAmount} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2">Pool Info</Typography>
      </Grid>
      <Grid item xs={6}>
        <TextField label="Pool Address" variant="outlined" value={poolAddress} fullWidth />
      </Grid>
      <Grid item xs={6}>
        <TextField label="Treasury Address" variant="outlined" value={treasury.address} fullWidth />
      </Grid>
      <Grid item xs={4}>
        <TextField label="Fee %" variant="outlined" value={fee} fullWidth />
      </Grid>
      <Grid item xs={4}>
        <TextField label="Reserve" variant="outlined" value={reserve} fullWidth />
      </Grid>
      <Grid item xs={4}>
        <TextField label="Price" variant="outlined" value={price} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2">Token</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={symbol}
          variant="outlined"
          value={token.address}
          helperText={`Total supply: ${totalSupply} - Decimals: ${token.decimals}`}
          fullWidth />
      </Grid>
    </Grid>

  }

  render() {
    const { classes } = this.props;
    const { visible, loading, lptAccount } = this.state;


    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Tooltip title="Add a LPT account">
          <IconButton color="primary" onClick={this.onOpen}>
            <AddRounded />
          </IconButton>
        </Tooltip>
        <Dialog open={visible} onClose={this.onClose}>
          <DialogTitle>
            <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
              <Grid item className={classes.stretch}>
                <Typography variant="h6">Add a LPT account</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={this.onClose} edge="end">
                  <CloseRounded />
                </IconButton>
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  variant="outlined"
                  value={lptAccount}
                  onChange={this.onAddress}
                  InputProps={{
                    endAdornment: <IconButton
                      color="primary"
                      onClick={this.onAdd}
                      edge="end"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} /> : <AddRounded />}
                    </IconButton>
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                {this.renderInfo()}
              </Grid>
              <Grid item xs={12} /> {/* Safe space */}
            </Grid>
          </DialogContent>
        </Dialog>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  updateWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Add)));