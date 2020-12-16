import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import { PublishRounded, DescriptionRounded, PowerRounded } from '@material-ui/icons';

import styles from './styles';
import { setWallet } from 'modules/wallet.reducer';


class KeyStore extends Component {
  constructor() {
    super();

    this.state = {
      file: ''
    }
  }

  onSave = () => {
    console.warn('Not implement yet');
  }

  render() {
    const { classes } = this.props;
    const { file } = this.state;

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
        <Typography>Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <Button startIcon={<PublishRounded />}>
              <Typography>Upload keystore</Typography>
            </Button>
          </Grid>
          <Grid item className={classes.stretch}>
            <TextField
              label="Password (optional)"
              variant="outlined"
              value={file}
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
  setWallet
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(KeyStore)));