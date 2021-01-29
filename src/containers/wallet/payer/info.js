import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Avatar from '@material-ui/core/Avatar';

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
    const { classes } = this.props;
    const { address, amount } = this.state;
    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">{utils.prettyNumber(Number(amount))} SOL</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <Tooltip title="QR Code">
              <Avatar className={classes.icon} onClick={this.onQRCode}>
                <Typography>{utils.randEmoji(address)}</Typography>
              </Avatar>
            </Tooltip>
          </Grid>
          <Grid item className={classes.stretch}>
            <InputBase placeholder='Receiver' value={address} fullWidth readOnly />
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