import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';

import { SendRounded } from '@material-ui/icons';

import styles from './styles';


class PayerTransfer extends Component {
  constructor() {
    super();

    this.state = {
      receiverAddress: '',
    }
  }

  onReceiverAddress = (e) => {
    const receiverAddress = e.target.value;
    return this.setState({ receiverAddress });
  }

  onTransfer = () => {
    console.log('Transfer');
  }

  render() {
    const { classes } = this.props;
    const { receiverAddress } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper elevation={0} className={classes.paper}>
          <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <InputBase
                placeholder='Receiver'
                onChange={this.onReceiverAddress}
                value={receiverAddress}
                onKeyPress={e => e.key === 'Enter' ? this.onTransfer : null}
                fullWidth
              />
            </Grid>
            <Grid item>
              <IconButton
                color="secondary"
                size="small"
                onClick={this.onTransfer}>
                <SendRounded />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({

}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PayerTransfer)));