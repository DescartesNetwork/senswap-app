import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';

import LPTList from 'containers/wallet/components/lptList';

import styles from './styles';


class LPTSelection extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
    }
  }

  onData = (data = {}) => {
    const { onChange } = this.props;
    return this.setState({ data }, () => {
      return onChange(data);
    });
  }

  render() {
    const { classes } = this.props;
    const { poolAddress } = this.props;
    const { data: { address: lptAddress, icon } } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="LPT account"
          variant="outlined"
          value={lptAddress || ''}
          onChange={this.onAddress}
          InputProps={{
            startAdornment: <Avatar className={classes.lptIcon}>
              <Typography variant="h5">{icon}</Typography>
            </Avatar>,
            endAdornment: <LPTList
              poolAddress={poolAddress}
              size="medium"
              onChange={this.onData}
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