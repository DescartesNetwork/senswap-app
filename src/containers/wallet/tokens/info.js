import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import InputBase from '@material-ui/core/InputBase';
import Avatar from '@material-ui/core/Avatar';

import AccountList from 'containers/wallet/components/accountList';

import styles from './styles';
import utils from 'helpers/utils';
import sol from 'helpers/sol';
import { setQRCode } from 'modules/wallet.reducer';


class TokenInfo extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
    }
  }

  onQRCode = () => {
    const { data: { address } } = this.state;
    const { setQRCode } = this.props;
    return setQRCode(true, address);
  }

  onData = (data = {}) => {
    return this.setState({ data });
  }

  render() {
    const { classes } = this.props;
    const { data: { address, amount, initialized, token } } = this.state;
    const symbol = initialized ? sol.toSymbol(token.symbol) : 'UNKOWN';
    const balance = initialized ? utils.prettyNumber(utils.div(amount, global.BigInt(10 ** token.decimals))) : 0;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">{balance} {symbol}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <Tooltip disableFocusListener title="QR Code">
              <Avatar className={classes.icon} onClick={this.onQRCode}>
                <Typography>{utils.randEmoji(address)}</Typography>
              </Avatar>
            </Tooltip>
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
            <AccountList onChange={this.onData} />
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
)(withStyles(styles)(TokenInfo)));