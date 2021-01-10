import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';

import { AddRounded, CloseRounded } from '@material-ui/icons';

import Info from './info';

import styles from './styles';


class Pools extends Component {
  constructor() {
    super();

    this.state = {
      visible: false,
      lptAccount: '',
    }
  }

  onOpen = () => {
    return this.setState({ visible: true });
  }

  onClose = () => {
    return this.setState({ visible: false });
  }

  onAddress = (e) => {
    const lptAccount = e.target.value || '';
    return this.setState({ lptAccount });
  }

  onAdd = () => {
    const { lptAccount } = this.state;
    console.log(lptAccount);
  }

  render() {
    const { classes } = this.props;
    const { visible, lptAccount } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item className={classes.stretch}>
            <Typography variant="h4">Swap Accounts</Typography>
          </Grid>
          <Grid item>
            <Tooltip title="Add a new LPT address">
              <IconButton color="primary" onClick={this.onOpen}>
                <AddRounded />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} /> {/* Safe space */}
      <Grid item xs={12}>
        <Info />
      </Grid>
      <Dialog open={visible} onClose={this.onClose}>
        <DialogTitle>
          <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
            <Grid item className={classes.stretch}>
              <Typography variant="h6">Add a LPT account</Typography>
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
                label="LPT Address"
                variant="outlined"
                value={lptAccount}
                onChange={this.onAddress}
                InputProps={{
                  endAdornment: <IconButton color="primary" onClick={this.onAdd} edge="end" >
                    <AddRounded />
                  </IconButton>
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} /> {/* Safe space */}
          </Grid>
        </DialogContent>
      </Dialog>
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
)(withStyles(styles)(Pools)));