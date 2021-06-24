import React, { Component, createRef } from 'react';
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
  constructor() {
    super();

    this.stakeRef = createRef();
    this.harvestRef = createRef();
  }
  handleStake = () => {
    const { onHandleStake } = this.props;
    const value = this.stakeRef.current.value;
    if (!value) return;
    onHandleStake(value);
  }
  handleHarvest = () => {
    const { onHandleHarvest } = this.props;
    const value = this.harvestRef.current.value;
    if (!value) return;
    onHandleHarvest(value);
  }

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
              inputRef={this.harvestRef}
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
              onClick={this.handleHarvest}
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
              inputRef={this.stakeRef}
              InputProps={{
                endAdornment: <Typography color="error" style={{ cursor: 'pointer' }}>
                  <strong>MAX</strong>
                </Typography>
              }} />
          </Grid>
          <Grid item xs={4} align="end">
            <Button color="secondary" onClick={this.handleStake}>UnStake</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleStake}
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