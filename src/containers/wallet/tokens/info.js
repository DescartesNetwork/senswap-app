import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';

import { WallpaperRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import AccountSelection from 'containers/wallet/components/accountSelection';

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
    if (!initialized) return null;
    const symbol = sol.toSymbol(token.symbol);
    const balance = utils.prettyNumber(utils.div(amount, global.BigInt(10 ** token.decimals)));

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">{balance} {symbol}</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: 0 }}>
        <Typography variant="body2">Address</Typography>
      </Grid>
      <Grid item xs={12}>
        <BaseCard variant="fluent" className={classes.paper}>
          <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
            <Grid item>
              <Tooltip title="QR Code">
                <IconButton color="secondary" onClick={this.onQRCode} size="small" >
                  <WallpaperRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item className={classes.stretch}>
              <InputBase placeholder='Receiver' value={address} fullWidth />
            </Grid>
            <Grid item>
              <AccountSelection onChange={this.onData} />
            </Grid>
          </Grid>
        </BaseCard>
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