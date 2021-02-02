import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import { CloseRounded, VisibilityRounded, VisibilityOffRounded } from '@material-ui/icons';

import styles from './styles';


const EMPTY = {
  visiblePassword: false,
  password: ''
}

class Unlock extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY
    }
  }

  onPassword = (e) => {
    const password = e.target.value || '';
    return this.setState({ password });
  }

  onVisiblePassword = () => {
    const { visiblePassword } = this.state;
    return this.setState({ visiblePassword: !visiblePassword });
  }

  onClose = () => {
    const { wallet: { unlock: { callback } } } = this.props;
    return this.setState({ ...EMPTY }, () => {
      return callback('User denied to unlock', null);
    });
  }

  onSubmit = () => {
    const { wallet: { unlock: { callback } } } = this.props;
    let { password } = this.state;
    if (!password) return;
    return this.setState({ ...EMPTY }, () => {
      return callback(null, password);
    });
  }

  render() {
    const { classes } = this.props;
    const { wallet: { unlock: { visible } } } = this.props;
    const { visiblePassword, password } = this.state;

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
            <TextField
              label="Password"
              type={visiblePassword ? 'text' : 'password'}
              variant="outlined"
              value={password}
              onChange={this.onPassword}
              InputProps={{
                endAdornment: <IconButton onClick={this.onVisiblePassword} edge="end">
                  {visiblePassword ? <VisibilityRounded /> : <VisibilityOffRounded />}
                </IconButton>
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} justify="flex-end">
              <Grid item>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={this.onSubmit}
                  fullWidth
                >
                  <Typography>OK</Typography>
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={this.onClose}
                  fullWidth
                >
                  <Typography>Cancel</Typography>
                </Button>
              </Grid>
            </Grid>
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
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Unlock)));