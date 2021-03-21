import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';

import { LanguageRounded } from '@material-ui/icons';

import InitializeNetwork from './intializeNetwork';

import styles from './styles';

class Network extends Component {
  constructor() {
    super();

    this.state = {
      advance: false,
    }
  }

  onAdvance = () => {
    const { wallet: { user: { role } } } = this.props;
    const { advance } = this.state;
    if (role === 'admin') return this.setState({ advance: !advance });
  }

  render() {
    const { classes } = this.props;
    const { advance } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <IconButton color="secondary" onClick={this.onAdvance}>
              <LanguageRounded />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h6">Network</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={advance}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <InitializeNetwork />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Network)));