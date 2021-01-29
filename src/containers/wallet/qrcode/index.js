import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import { CloseRounded, GetAppRounded } from '@material-ui/icons';

import Drain from 'components/drain';

import styles from './styles';
import { setQRCode } from 'modules/wallet.reducer';


class MyQRCode extends Component {
  constructor() {
    super();

    this.state = {
      copied: false
    }
  }

  onClose = () => {
    return this.props.setQRCode(false);
  }

  onCopy = () => {
    return this.setState({ copied: true }, () => {
      return setTimeout(() => {
        return this.setState({ copied: false });
      }, 1000);
    });
  }

  onDownload = () => {
    const canvas = document.getElementById('senwallet-qrcode');
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'senwallet-qrcode.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  render() {
    const { classes } = this.props;
    const { wallet: { qrcode: { visible, message } } } = this.props;
    const { copied } = this.state;

    return <Dialog open={visible} onClose={this.onClose}>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">QR Code</Typography>
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
            <Grid container justify="center" spacing={2}>
              <Grid item>
                <QRCode id="senwallet-qrcode" value={message} size={256} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Drain small />
          </Grid>
          <Grid item xs={12}>
            <Tooltip
              open={copied}
              title="Copied"
              arrow
              disableFocusListener
              disableHoverListener
              disableTouchListener
            >
              <Typography align="center" className={classes.message}>{message}</Typography>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <CopyToClipboard text={message} onCopy={this.onCopy}>
              <Button
                color="primary"
                variant="contained"
                fullWidth
              >
                <Typography>Copy</Typography>
              </Button>
            </CopyToClipboard>
          </Grid>
          <Grid item xs={6}>
            <Button
              color="primary"
              variant="outlined"
              startIcon={<GetAppRounded />}
              onClick={this.onDownload}
              fullWidth
            >
              <Typography>Download</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} /> {/* Safe space */}
        </Grid>
      </DialogContent>
    </Dialog >
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
)(withStyles(styles)(MyQRCode)));