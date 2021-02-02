import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import { CloseRounded, SettingsRounded } from '@material-ui/icons';

import ListTokenAccount from './list';
import AddTokenAccount from './add';
import CreateTokenAccount from './create';

import styles from './styles';


class TokenSettings extends Component {
  constructor() {
    super();

    this.state = {
      visible: false,
    }
  }

  onClose = () => {
    return this.setState({ visible: false });
  }

  onOpen = () => {
    return this.setState({ visible: true });
  }

  render() {
    const { classes } = this.props;
    const { visible } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Tooltip disableFocusListener title="Settings">
          <IconButton color="secondary" size="small" onClick={this.onOpen} >
            <SettingsRounded />
          </IconButton>
        </Tooltip>
        <Dialog open={visible} onClose={this.onClose}>
          <DialogTitle>
            <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
              <Grid item className={classes.stretch}>
                <Typography variant="h6">Token Settings</Typography>
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
                <AddTokenAccount />
              </Grid>
              <Grid item xs={12}>
                <CreateTokenAccount />
              </Grid>
              <Grid item xs={12} /> {/* Safe space */}
              <Grid item xs={12}>
                <ListTokenAccount />
              </Grid>
              <Grid item xs={12} /> {/* Safe space */}
            </Grid>
          </DialogContent>
          <DialogActions /> {/* Safe space */}
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
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TokenSettings)));