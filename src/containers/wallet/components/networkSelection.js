import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import NetworkAvatar from 'containers/wallet/components/networkAvatar';
import NetworkList from 'containers/wallet/components/networkList';

import styles from './styles';


class NetworkSelection extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
    }
  }

  onData = (data) => {
    const { onChange } = this.props;
    return this.setState({ data }, () => {
      return onChange(data);
    });
  }

  render() {
    // const { classes } = this.props;
    const { label, mintAddress } = this.props;
    const { data: { address, mints } } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          label={label}
          InputProps={{
            startAdornment: <NetworkAvatar
              mintAddresses={mints}
              title={address}
              marginRight
            />,
            endAdornment: <NetworkList onChange={this.onData} mintAddress={mintAddress} />
          }}
          value={address || ''}
          fullWidth
        />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

NetworkSelection.defaultProps = {
  label: 'Network',
  mintAddress: '',
  onChange: () => { },
}

NetworkSelection.propTypes = {
  label: PropTypes.string,
  mintAddress: PropTypes.string,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NetworkSelection)));