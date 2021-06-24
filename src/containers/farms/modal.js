import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Dialog, { DialogTitle, DialogContent, DialogContentText, DialogActions } from 'senswap-ui/dialog';
import Drain from 'senswap-ui/drain';
import TextField from 'senswap-ui/textField';
import Button from 'senswap-ui/button';

import styles from './styles';
class Modal extends Component {
  render() {
    const { visible, onClose, modalData: data } = this.props;
    console.log(data)
    return <Dialog open={visible} onClose={onClose}>
      <DialogTitle>Stat farming</DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid item xs={12}>
            <Typography color="textSecondary">Annual Percentage</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">APR: {data.apr}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">APY: {data.apy}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Drain size={1} />
          </Grid>
          <Grid item xs={12}>
            <Typography color="textSecondary">Pending reward</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">Reward: {data.pendingReward} SEN</Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField
              variant="contained"
              defaultValue="0"
              InputProps={{
                endAdornment: <Typography color="error" style={{ cursor: 'pointer' }}>
                  <strong>MAX</strong>
                </Typography>
              }} />
          </Grid>
          <Grid item xs={4} align="end">
            <Button
              variant="contained"
              color="primary"
            >
              Harvest
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Drain size={1} />
          </Grid>
          <Grid item xs={12}>
            <Typography color="textSecondary">Start data</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">Your staked: {data.staked} FT</Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField
              variant="contained"
              defaultValue="0"
              InputProps={{
                endAdornment: <Typography color="error" style={{ cursor: 'pointer' }}>
                  <strong>MAX</strong>
                </Typography>
              }} />
          </Grid>
          <Grid item xs={4} align="end">
            <Button color="secondary">UnStake</Button>
            <Button
              variant="contained"
              color="primary"
            >
              Stake
            </Button>
          </Grid>
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

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Modal)));