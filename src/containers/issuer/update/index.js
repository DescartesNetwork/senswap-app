import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';

import { FlightTakeoffRounded } from '@material-ui/icons';

import MintAvatar from 'containers/wallet/components/mintAvatar';
import MintList from 'containers/wallet/components/mintList';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getMint, getMints, updateMint } from 'modules/mint.reducer';

const EMPTY = {
  loading: false,
  ok: false,
}

class UpdateMint extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      condition: {},
      limit: 5,
      page: -1,
      index: 0,
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { getMints, getMint, setError } = this.props;
    let { condition, limit, page } = this.state;
    return this.setState({ loading: true }, () => {
      return getMints(condition, limit, page + 1).then(mintIds => {
        return Promise.all(mintIds.map(mintId => getMint(mintId)));
      }).then(data => {
        return this.setState({ ...EMPTY, data }, () => {
          return this.onSelect(0);
        });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  onUpdate = () => {

  }

  onSelect = (index) => {
    return this.setState({ index });
  }

  render() {
    const { classes } = this.props;
    const { loading, index, data, ok } = this.state;

    const mint = data[index] || {};

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">Token info</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          label={(mint.name || 'Unknown') + ' / ' + (mint.symbol || 'Unknown')}
          InputProps={{
            startAdornment: <MintAvatar
              icon={mint.icon}
              title={mint.name}
              marginRight
            />,
            endAdornment: <MintList />
          }}
          value={mint.address || ''}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} className={classes.noWrap} alignItems="flex-end">
          <Grid item className={classes.stretch}>
            <Typography variant="body2">{ok ? 'Done!' : ''}</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={this.onUpdate}
              endIcon={<FlightTakeoffRounded />}
              disabled={loading}
            >
              <Typography>Update</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  mint: state.mint,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getMint, getMints, updateMint,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(UpdateMint)));