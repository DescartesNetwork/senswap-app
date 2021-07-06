import React, { Component, createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Drain from 'senswap-ui/drain';
import TextField from 'senswap-ui/textField';
import Button from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getStakePools } from 'modules/stakePool.reducer';
import { MintAvatar } from 'containers/wallet';

import styles from './styles';
class Seed extends Component {
  constructor() {
    super();

    this.state = {
      maxToken: 0,
    }
    this.seedRef = createRef();
  }

  handleSeed = (type) => {
    const { onHandleSeed } = this.props;
    const value = this.seedRef.current.value;
    if (!value) return setError('Amount is required');
    onHandleSeed(value, type);
  }

  getMaxToken = () => {
    const { detail } = this.props;
    if (!detail && !detail.length < 1) return;
    const { total_shares, mint_token: { decimals } } = detail;
    const share = ssjs.undecimalize(total_shares, decimals);
    return this.setState({ maxToken: share });
  }

  onChange = () => {
    const value = this.seedRef.current.value;
    this.setState({ maxToken: value });
  }

  render() {
    const { maxToken } = this.state;
    const { visible, onClose, detail: data, seedLoading, unSeedLoading } = this.props;
    if (!data || !data.pool) return null;
    const {
      pool: {
        treasury_sen: { amount }
      },
      mint: { decimals }
    } = data;

    return <Fragment>
      <Dialog open={visible} onClose={onClose}>
        <DialogTitle>Seed / Unseed</DialogTitle>
        <DialogContent>
          <Grid container alignItems="center">
            <Grid item xs={12}>
              <Typography color="textSecondary">Stake pool</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Address: {data.address}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Treasury SEN amount: {amount ? ssjs.undecimalize(amount, decimals) : 0}</Typography>
            </Grid>
            {/* Seed + unSeed */}
            <Grid item xs={12}>
              <Typography color="textPrimary">Start seeding: </Typography>
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant="contained"
                value={maxToken}
                inputRef={this.seedRef}
                onChange={this.onChange}
                InputProps={{
                  endAdornment: <Typography color="error" style={{ cursor: 'pointer' }} onClick={this.getMaxToken}>
                    <strong>MAX</strong>
                  </Typography>
                }} />
            </Grid>
            <Grid item xs={4} align="end">
              {unSeedLoading ? <Button variant="outlined" color="secondary" disabled>Unseed</Button> :
                <Button variant="outlined" onClick={() => this.handleSeed('unseed')}>Unseed</Button>}
              {seedLoading ? <Button
                variant="contained"
                color="secondary" disabled>Seed <CircularProgress size={16} /></Button> :
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.handleSeed()}
                >
                  Seed
            </Button>}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Fragment>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError, setSuccess,
  getStakePools,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Seed)));