import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import MintAvatar from 'containers/wallet/components/mintAvatar';
import MintList from 'containers/wallet/components/mintList';

import styles from './styles';

class MintSelection extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
    }

    this.swap = window.senwallet.swap;
  }

  onData = (data) => {
    const { onChange } = this.props;
    return this.setState({ data }, () => {
      return onChange(data);
    });
  }

  render() {
    // const { classes } = this.props;
    const { data } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          label={(data.name || 'Unknown') + ' / ' + (data.symbol || 'Unknown')}
          InputProps={{
            startAdornment: <MintAvatar
              icon={data.icon}
              title={data.name}
              marginRight
            />,
            endAdornment: <MintList onChange={this.onData} />
          }}
          value={data.address || ''}
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

MintSelection.defaultProps = {
  onChange: () => { },
}

MintSelection.propTypes = {
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MintSelection)));