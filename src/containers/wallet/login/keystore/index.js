import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import fileDownload from 'js-file-download';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';

import {
  PublishRounded, DescriptionRounded, PowerRounded,
  HelpRounded, CloseRounded, GetAppRounded,
  VisibilityRounded, VisibilityOffRounded,
} from '@material-ui/icons';

import styles from './styles';
import crypto from 'helpers/crypto';
import { setWallet } from 'modules/wallet.reducer';


class KeyStore extends Component {
  constructor() {
    super();

    this.state = {
      password: '',
      newPassword: '',
      filename: '',
      keystore: {},
      newKeystore: {},
      visible: false,
    }
  }

  onUpload = () => {
    return document.getElementById('keystore-file').click();
  }

  onKeystore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = () => {
      return this.setState({
        filename: file.name,
        keystore: JSON.parse(reader.result)
      });
    }
  }

  onPassword = (e) => {
    const password = e.target.value || '';
    return this.setState({ password });
  }

  onNewPassword = (e) => {
    const newPassword = e.target.value || '';
    return this.setState({ newPassword });
  }

  onShowPassword = () => {
    const { showPassword } = this.state;
    return this.setState({ showPassword: !showPassword });
  }

  onSave = () => {
    const { password, keystore } = this.state;
    const { setWallet } = this.props;
    if (!password || !keystore) return console.error('Invalid input');
    return crypto.fromSolFlareKeystore(keystore, password).then(account => {
      const address = account.publicKey.toBase58();
      const secretKey = Buffer.from(account.secretKey).toString('hex');
      return setWallet(address, secretKey);
    }).catch(er => {
      return console.error(er);
    });
  }

  onGen = () => {
    const { newPassword } = this.state;
    if (!newPassword) return console.error('Invalid input');
    return crypto.createKeystore(null, newPassword).then(newKeystore => {
      return this.setState({ newKeystore });
    }).catch(er => {
      return console.error(er);
    });
  }

  onDownload = () => {
    const { newKeystore } = this.state;
    if (!newKeystore.publicKey) return console.error('Invalid input');
    return fileDownload(
      JSON.stringify(newKeystore),
      `senwallet-keystore-${newKeystore.publicKey}.json`
    );
  }

  onOpen = () => {
    return this.setState({ visible: true });
  }

  onClose = () => {
    return this.setState({ visible: false });
  }

  render() {
    const { classes } = this.props;
    const { password, newPassword, newKeystore, filename, visible, showPassword } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <IconButton size="small" color="primary">
              <DescriptionRounded />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h6">Keystore</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography>This keystore format is compatible with <Link href="https://solflare.com" target="_blank">SolFlare</Link> keystore.</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="Filename"
          variant="outlined"
          value={filename}
          InputProps={{
            endAdornment: <Grid item>
              <Button onClick={this.onUpload} startIcon={<PublishRounded />}>
                <Typography>Upload</Typography>
              </Button>
            </Grid>,
            readOnly: true
          }}
          fullWidth
        />
        <input
          id="keystore-file"
          type="file"
          accept="application/json"
          onChange={this.onKeystore}
          style={{ "display": "none" }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="Password"
          type={'password'}
          variant="outlined"
          value={password}
          onChange={this.onPassword}
          InputProps={{
            endAdornment: <IconButton
              color="primary"
              onClick={this.onSave}
              edge="end"
            >
              <PowerRounded />
            </IconButton>
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} justify="flex-end">
          <Grid item>
            <Button onClick={this.onOpen} startIcon={<HelpRounded />} fullWidth >
              <Typography>Not have keystore yet?</Typography>
            </Button>
          </Grid>
        </Grid>
        <Dialog open={visible} onClose={this.onClose}>
          <DialogTitle>
            <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
              <Grid item className={classes.stretch}>
                <Typography variant="h6">Password</Typography>
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
                <Typography>The password is used to encrypt your keystore. You will need this password to unlock your keystore in demands.</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={newPassword}
                  onChange={this.onNewPassword}
                  InputProps={{
                    endAdornment: <IconButton onClick={this.onShowPassword} edge="end">
                      {showPassword ? <VisibilityRounded /> : <VisibilityOffRounded />}
                    </IconButton>
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2} alignItems="center" justify="flex-end" className={classes.noWrap}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={this.onGen}
                      disabled={!newPassword}
                    >
                      <Typography>Create</Typography>
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<GetAppRounded />}
                      onClick={this.onDownload}
                      disabled={!newKeystore.publicKey}
                    >
                      <Typography>Download</Typography>
                    </Button>
                  </Grid>
                </Grid>
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
  setWallet
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(KeyStore)));