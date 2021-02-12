import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import LPTList from './lptList';
import LPTAvatar from './lptAvatar';

import styles from './styles';


class LPTSelection extends Component {
  constructor() {
    super();

    this.state = {
      lptAddress: '',
    }
  }

  onAddress = (lptAddress) => {
    const { onChange } = this.props;
    return this.setState({ lptAddress }, () => {
      return onChange(lptAddress);
    });
  }

  render() {
    // const { classes } = this.props;
    const { poolAddress } = this.props;
    const { lptAddress } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="LPT account"
          variant="outlined"
          value={lptAddress || ''}
          onChange={this.onAddress}
          InputProps={{
            startAdornment: <LPTAvatar address={lptAddress} marginRight />,
            endAdornment: <LPTList
              poolAddress={poolAddress}
              size="medium"
              onChange={this.onAddress}
              edge="end"
            />,
            readOnly: true
          }}
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

LPTSelection.defaultProps = {
  poolAddress: '',
  onChange: () => { },
}

LPTSelection.propTypes = {
  poolAddress: PropTypes.string,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LPTSelection)));