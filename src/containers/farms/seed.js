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
import Paper from 'senswap-ui/paper';
import Avatar, { AvatarGroup } from "senswap-ui/avatar";

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
    const { onHandleSeed, detail } = this.props;
    const { senWallet } = detail;
    const amount = this.seedRef.current.value;
    if (!amount) return setError('Amount is required');
    const data = { amount, senWallet };
    onHandleSeed(data, type);
  }

  getMaxToken = () => {
    const { detail: { pool, amount: accAmount } } = this.props;
    if (!pool) return;
    const { mint_token: { decimals } } = pool;
    const total = ssjs.undecimalize(accAmount, decimals);
    return this.setState({ maxToken: total });
  }

  onChange = () => {
    const value = this.seedRef.current.value;
    this.setState({ maxToken: value });
  }

  onHandleClose = () => {
    const { onClose } = this.props;
    this.setState({ maxToken: 0 });
    return onClose();
  }

  render() {
    const { maxToken } = this.state;
    const { classes, visible, detail: data, seedLoading, unSeedLoading } = this.props;
    if (!data || !data.pool) return null;
    const {
      pool: {
        treasury_sen: { amount },
        mintS: { icon: iconS, symbol: symbolS },
        mintA: { icon: iconA, symbol: symbolA },
        mintB: { icon: iconB, symbol: symbolB },
      },
      mint: { decimals },
      amount: accAmount,
    } = data;
    const icons = [iconA, iconB, iconS];
    const name = `${symbolA} x ${symbolB} x ${symbolS}`;
    return <Fragment>
      <Dialog open={visible} onClose={this.onHandleClose}>
        <DialogTitle>Seed / Unseed</DialogTitle>
        <DialogContent>
          <Grid container alignItems="center">
            {/* <Grid item xs={12}>
              <Typography color="textSecondary">Stake pool</Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.formPaper}>
                <Grid container>
                  <Grid item xs={12}>
                    <Grid container alignItems="center" spacing={0}>
                      <Typography color="textSecondary" variant="body2">From:</Typography>
                      <Grid item>
                        <Avatar src={iconS} />
                      </Grid>
                      <Grid item>
                        <Typography color="textSecondary">{symbolS}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid> */}
            {/* Seed + unSeed */}
            <Grid item xs={12}>
              <Typography color="textSecondary">Start seeding: </Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.formPaper}>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Available: <strong style={{ color: '#f31241' }}>{accAmount ? ssjs.undecimalize(accAmount, decimals) : 0}</strong> SEN</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Total SEN: <strong style={{ color: '#f31241' }}>{amount ? ssjs.undecimalize(amount, decimals) : 0}</strong></Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container className={classes.outlineInput} spacing={0}>
                      <Grid item xs={6}>
                        <Grid container alignItems="center">
                          <Grid item>
                            <AvatarGroup>
                              {icons ? icons.map((e, idx) => {
                                return <Avatar src={e} key={idx} />
                              }) : <Avatar />}
                            </AvatarGroup>
                          </Grid>
                          <Grid item>
                            <Typography color="textSecondary">{name ? name : 'UNKNOWN'}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          variant="standard"
                          value={maxToken}
                          inputRef={this.seedRef}
                          onChange={this.onChange}
                          fullWidth
                          InputProps={{
                            disableUnderline: true,
                            endAdornment: <Typography color="error" style={{ cursor: 'pointer' }} onClick={this.getMaxToken}>
                              <strong>MAX</strong>
                            </Typography>
                          }} />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Drain size={3} />

                {/* Button */}
                <Grid item xs={12} align="end">
                  <Grid container>
                    <Grid item xs={6} className={classes.button}>
                      {unSeedLoading ? <Button variant="outlined" color="secondary" fullWidth disabled>Unseed</Button> :
                        <Button variant="outlined" onClick={() => this.handleSeed('unseed')} fullWidth>Unseed</Button>}
                    </Grid>
                    <Grid item xs={6} className={classes.button}>
                      {seedLoading ? <Button
                        variant="contained"
                        color="secondary" fullWidth disabled>Seed <CircularProgress size={16} /></Button> :
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => this.handleSeed()}
                          fullWidth
                        >
                          Seed
                        </Button>}
                    </Grid>
                  </Grid>
                </Grid>
                <Drain size={1} />
              </Paper>
            </Grid>
          </Grid>
          <Drain size={2} />
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