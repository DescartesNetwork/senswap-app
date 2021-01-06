import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import { WallpaperRounded } from '@material-ui/icons';

import utils from 'helpers/utils';
import sol from 'helpers/sol';
import styles from './styles';
import { setQRCode } from 'modules/wallet.reducer';


class PayerInfo extends Component {
  constructor() {
    super();

    this.state = {
      address: '',
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
    const { wallet: { user: { address } } } = this.props;
    return sol.getBalance(address).then(re => {
      return this.setState({ address, amount: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  onQRCode = () => {
    const { address } = this.state;
    const { setQRCode } = this.props;
    return setQRCode(true, address);
  }

  render() {
    const { address, amount } = this.state;
    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">{utils.prettyNumber(Number(amount))} SOL</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: 0 }}>
        <Typography variant="body2">Address</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingTop: 0 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={9}>
            <Typography noWrap>{address}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Grid container justify="flex-end" spacing={2}>
              <Grid item>
                <Tooltip title="QR Code">
                  <IconButton color="secondary" onClick={this.onQRCode} >
                    <WallpaperRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
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
  setQRCode,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PayerInfo)));