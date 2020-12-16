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
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Popover from '@material-ui/core/Popover';

import {
  FileCopyRounded, WallpaperRounded, InfoRounded,
  ExpandMoreRounded, SendRounded,
} from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import Drain from 'components/drain';

import sol from 'helpers/sol';
import styles from './styles';


class TokenCard extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
      tokenData: {},
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
    const { wallet: { token } } = this.props;
    return sol.getTokenData(token).then(re => {
      return this.setState({ tokenData: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  onOpenPopover = (e) => {
    return this.setState({ anchorEl: e.currentTarget });
  }

  onClosePopover = () => {
    return this.setState({ anchorEl: null });
  }

  render() {
    const { classes } = this.props;
    const { wallet: { address: payerAddress } } = this.props;
    const {
      anchorEl,
      tokenData: { address, amount, initialized, owner, token }
    } = this.state;
    if (!initialized) return null;
    const symbol = token.symbol.join('').replace('-', '');
    const balance = (amount / global.BigInt(10 ** token.decimals)).toString();
    const balanceDecimals = (amount % global.BigInt(10 ** token.decimals)).toString();

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <BaseCard className={classes.card}>
          <Grid item xs={12}>
            <Drain />
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4">{Number(balance + '.' + balanceDecimals)} {symbol}</Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingBottom: 0 }}>
              <Typography variant="h6">Address</Typography>
            </Grid>
            <Grid item xs={12} style={{ paddingTop: 0 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={8}>
                  <Typography noWrap>{address}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Grid container justify="flex-end" spacing={2}>
                    <Grid item>
                      <Tooltip title="Copy">
                        <IconButton
                          color="secondary"
                          edge="end"
                        >
                          <FileCopyRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title="QR Code">
                        <IconButton
                          color="secondary"
                        >
                          <WallpaperRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={0} className={classes.paper}>
                <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
                  <Grid item className={classes.stretch}>
                    <InputBase
                      placeholder='Token address'
                      onChange={console.log}
                      value=''
                      onKeyPress={e => e.key === 'Enter' ? console.log : null}
                      fullWidth
                    />
                  </Grid>
                  <Grid item>
                    <IconButton
                      color="secondary"
                      size="small"
                      onClick={console.log}>
                      <SendRounded />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Drain small />
            </Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
                <Grid item className={classes.stretch}>
                  <Tooltip title="Token information">
                    <IconButton
                      color="secondary"
                      size="small"
                      onClick={this.onOpenPopover}
                    >
                      <InfoRounded />
                    </IconButton>
                  </Tooltip>
                  <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={this.onClosePopover}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    PaperProps={{ className: classes.popover }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography><strong>Address:</strong> {token.address}</Typography>
                        <Typography><strong>Symbol:</strong> {symbol}</Typography>
                        <Typography><strong>Decimals:</strong> {token.decimals}</Typography>
                        <Typography><strong>Total Supply:</strong> {token.total_supply.toString()}</Typography>
                      </Grid>
                    </Grid>
                  </Popover>
                </Grid>
                <Grid item>
                  <Tooltip title="Token information">
                    <IconButton
                      color="secondary"
                      size="small"
                    >
                      <ExpandMoreRounded />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
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

}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TokenCard)));