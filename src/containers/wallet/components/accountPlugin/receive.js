import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import { IconButton } from 'senswap-ui/button';
import TextField from 'senswap-ui/textField';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Paper from 'senswap-ui/paper';
import Drain from 'senswap-ui/drain';
import Tooltip from 'senswap-ui/tooltip';

import { CloseRounded, FilterNoneRounded } from 'senswap-ui/icons';

import MintAvatar from 'containers/wallet/components/mintAvatar';
import Price from './price';

import styles from './styles';


class Receive extends Component {
  constructor() {
    super();

    this.state = {
      copied: false
    }
  }

  onCopy = () => {
    return this.setState({ copied: true }, () => {
      return setTimeout(() => {
        return this.setState({ copied: false });
      }, 3000);
    });
  }

  render() {
    const { classes } = this.props;
    const { visible, data: { address, amount: balance, mint }, onClose } = this.props;
    const { copied } = this.state;
    const { icon, name, ticket, symbol, decimals } = mint || {}

    return <Dialog open={visible} onClose={onClose} fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item>
            <MintAvatar icon={icon} />
          </Grid>
          <Grid item className={classes.stretch}>
            <Typography variant="subtitle1" style={{ marginBottom: -6 }}>Receive {symbol}</Typography>
            <Typography variant="body2" color="textSecondary">{name}</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={onClose} edge="end">
              <CloseRounded />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} >
            <Paper className={classes.paperInReceive}>
              <Grid container spacing={0} className={classes.noWrap}>
                <Grid item className={classes.stretch} >
                  <Typography variant="subtitle1">Total Balance</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1" align="right">{ssjs.undecimalize(balance, decimals)}</Typography>
                  <Price amount={parseFloat(ssjs.undecimalize(balance, decimals))} ticket={ticket} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} >
            <Paper className={classes.paperInReceive}>
              <Grid container spacing={2} justify="center">
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Address</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Only send {symbol} to this address. <span style={{ color: '#808191' }}>Sending any other asset to this address may result in the loss of your deposit!</span></Typography>
                </Grid>
                <Grid item xs={12} />
                <Grid item xs={12}>
                  <TextField
                    variant="contained"
                    label={`${symbol} Receiver Address`}
                    value={address}
                    InputProps={{
                      endAdornment: <CopyToClipboard text={address} onCopy={this.onCopy}>
                        <Tooltip
                          open={copied}
                          title="Copied"
                          arrow
                          disableFocusListener
                          disableHoverListener
                          disableTouchListener
                        >
                          <IconButton size="small" color="primary">
                            <FilterNoneRounded />
                          </IconButton>
                        </Tooltip>
                      </CopyToClipboard>
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} >
                  <Drain size={1} />
                </Grid>
                <Grid item>
                  <QRCode value={address} size={140} bgColor="#161920" fgColor="#ffffff" />
                </Grid>
                <Grid item xs={12} >
                  <Drain size={1} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} />
        </Grid>
      </DialogContent>
    </Dialog>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

Receive.defaultProps = {
  visible: false,
  data: {},
  onClose: () => { },
}

Receive.propTypes = {
  visible: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Receive)));