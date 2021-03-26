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
import Switch from '@material-ui/core/Switch';

import { CloseRounded, VisibilityRounded, VisibilityOffRounded } from '@material-ui/icons';

import styles from './styles';
import { setRemembered } from 'modules/wallet.reducer';


const EMPTY = {
  visiblePassword: false,
  password: ''
}

class Unlock extends Component {
  constructor(props) {
    super(props);

    const { wallet: { unlock: { remembered } } } = props;
    this.state = {
      ...EMPTY,
      remembered: Boolean(remembered),
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
    const { wallet: { unlock: { callback, remembered } }, setRemembered } = this.props;
    const { password, remembered: newRemembered } = this.state;
    if (!password) return;

    return this.setState({ ...EMPTY }, () => {
      if (Boolean(remembered) !== newRemembered) {
        if (!newRemembered) setRemembered();
        else setRemembered(password);
      };
      return callback(null, password);
    });
  }

  onRemembered = (e) => {
    const remembered = e.target.checked;
    return this.setState({ remembered });
  }

  render() {
    const { classes } = this.props;
    const { wallet: { unlock: { visible } } } = this.props;
    const { visiblePassword, password, remembered } = this.state;

    return <Dialog open={visible} onClose={this.onClose}>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Unlock wallet</Typography>
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
              onKeyPress={e => {
                if (e.key === 'Enter') return this.onSubmit();
              }}
              InputProps={{
                endAdornment: <IconButton onClick={this.onVisiblePassword} edge="end">
                  {visiblePassword ? <VisibilityRounded /> : <VisibilityOffRounded />}
                </IconButton>
              }}
              autoFocus
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} className={classes.noWrap} alignItems="center">
              <Grid item className={classes.stretch}>
                <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
                  <Grid item>
                    <Switch
                      size="small"
                      color="primary"
                      checked={remembered}
                      onChange={this.onRemembered}
                    />
                  </Grid>
                  <Grid item>
                    <Typography className={classes.subtitle}>Remember me?</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Button
                  color="secondary"
                  onClick={this.onClose}
                  fullWidth
                >
                  <Typography>Cancel</Typography>
                </Button>
              </Grid>
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
  setRemembered,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Unlock)));