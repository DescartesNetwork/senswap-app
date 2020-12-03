import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';

import { BaseCard } from 'components/cards';

import styles from './styles';


class Swap extends Component {
  constructor() {
    super();

    this.state = {
      from: 'SOL',
      to: 'WETH'
    }
  }

  onFrom = (value) => {
    console.log('from', value);
  }

  onTo = (value) => {
    console.log('to', value);
  }

  render() {
    const { classes } = this.props;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={10}>
        <Grid container justify="center" spacing={2}>
          <Grid item xs={6}>
            <BaseCard>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">From</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container alignItems="center" spacing={2} className={classes.noWrap}>
                    <Grid item className={classes.stretch}>
                      <TextField label="Amount" variant="outlined" fullWidth />
                    </Grid>
                    <Grid item>
                      <Select
                        // value={age}
                        variant="outlined"
                        onChange={this.onFrom}
                      >
                        <MenuItem value={'sol'}>SOL</MenuItem>
                        <MenuItem value={'weth'}>WETH</MenuItem>
                        <MenuItem value={'wbtc'}>WBTC</MenuItem>
                      </Select>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">To</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container alignItems="center" spacing={2} className={classes.noWrap}>
                    <Grid item className={classes.stretch}>
                      <TextField label="Amount" variant="outlined" fullWidth />
                    </Grid>
                    <Grid item>
                      <Select
                        // value={age}
                        variant="outlined"
                        onChange={this.onTo}
                      >
                        <MenuItem value={'sol'}>SOL</MenuItem>
                        <MenuItem value={'weth'}>WETH</MenuItem>
                        <MenuItem value={'wbtc'}>WBTC</MenuItem>
                      </Select>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="primary" size="large" fullWidth>
                    <Typography variant="body2">Swap</Typography>
                  </Button>
                </Grid>
              </Grid>

            </BaseCard>
          </Grid>
        </Grid>
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
)(withStyles(styles)(Swap)));