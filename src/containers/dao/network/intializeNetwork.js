import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import { AddRounded } from '@material-ui/icons';

import MintAvatar from 'containers/wallet/components/mintAvatar';
import Token from './token';

import styles from './styles';
import configs from 'configs';
import { getMintData } from 'modules/bucket.reducer';
import { setError } from 'modules/ui.reducer';


class InitializeNetwork extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      address: '',
      data: {},
      mints: [],
    }
  }

  componentDidMount() {
    // Fetch SEN
    const { sol: { senAddress } } = configs;
    const { getMintData } = this.props;
    return this.setState({ loading: true }, () => {
      return getMintData(senAddress).then(data => {
        const mints = [data];
        return this.setState({ loading: false, mints });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onAddress = (e) => {
    const address = e.target.value || '';
    return this.setState({ address }, this.onData);
  }

  onData = () => {
    const { getMintData, setError } = this.props;
    const { address } = this.state;
    if (!ssjs.isAddress(address)) return this.setState({ data: {} });
    return this.setState({ loading: true }, () => {
      return getMintData(address).then(data => {
        return this.setState({ loading: false, data });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onAdd = () => {
    const { data, mints } = this.state;
    let existing = false;
    mints.forEach(({ address }) => {
      if (address === data.address) return existing = true;
    });
    if (existing) return this.setState({ address: '', data: {} });
    const newMints = [...mints];
    newMints.push(data);
    return this.setState({ address: '', data: {}, mints: newMints });
  }

  onDelete = (index) => {
    const { mints } = this.state;
    const newMints = [...mints];
    newMints.splice(index, 1);
    return this.setState({ mints: newMints });
  }

  render() {
    // const { classes } = this.props;
    const { address, data: { name, icon, symbol }, mints, loading } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label={name || 'Token'}
          variant="outlined"
          value={address}
          onChange={this.onAddress}
          InputProps={{
            startAdornment: <MintAvatar
              icon={icon}
              title={symbol}
              marginRight
            />,
            endAdornment: <IconButton
              edge="end"
              color="secondary"
              onClick={this.onAdd}
              disabled={loading}
            >
              {loading ? <CircularProgress size={17} /> : <AddRounded />}
            </IconButton>
          }}
          onKeyPress={e => {
            if (e.key === 'Enter') return this.onAdd();
          }}
          helperText="You can add maximum 11 token including SEN to a network"
          fullWidth
        />
      </Grid>
      {mints.map((mint, index) => <Grid item key={index}>
        <Token
          data={mint}
          onDelete={() => this.onDelete(index)}
          readOnly={index === 0}
        />
      </Grid>)}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getMintData,
  setError,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(InitializeNetwork)));