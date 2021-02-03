import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import { ExploreRounded } from '@material-ui/icons';

import AccountAvatar from 'containers/wallet/components/accountAvatar';

import styles from './styles';
import utils from 'helpers/utils';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { setQRCode } from 'modules/wallet.reducer';


class PayerInfo extends Component {
  constructor() {
    super();

    this.state = {
      amount: 0,
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: prevUser } } = prevProps;
    const { wallet: { user } } = this.props;
    if (!isEqual(user, prevUser)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { user: { address } }, setError } = this.props;
    return sol.getBalance(address).then(re => {
      return this.setState({ amount: re });
    }).catch(er => {
      return setError(er);
    });
  }

  onQRCode = () => {
    const { wallet: { user: { address } } } = this.props;
    const { setQRCode } = this.props;
    return setQRCode(true, address);
  }

  render() {
    const { classes } = this.props;
    const { wallet: { user: { address } } } = this.props;
    const { amount } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">{utils.prettyNumber(Number(amount))} SOL</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <AccountAvatar title="QR Code" address={address} onClick={this.onQRCode} />
          </Grid>
          <Grid item className={classes.stretch}>
            <InputBase
              placeholder='Receiver'
              value={address || ''}
              fullWidth
              readOnly
            />
          </Grid>
          <Grid item>
            <Tooltip title="View on explorer">
              <IconButton
                color="secondary"
                size="small"
                href={utils.explorer(address)}
                target="_blank"
                rel="noopener"
              >
                <ExploreRounded />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  setQRCode,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PayerInfo)));