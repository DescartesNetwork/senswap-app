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
import NetworkInfo from './info';

import styles from './styles';
import { getNetworks, getNetwork } from 'modules/network.reducer';
import { setError } from 'modules/ui.reducer';


class Network extends Component {
  constructor() {
    super();

    this.state = {
      data: [],
      advance: false,
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { getNetworks, getNetwork, setError } = this.props;
    return getNetworks({}, 1000, 0).then(data => {
      return Promise.all(data.map(({ _id }) => {
        return getNetwork(_id);
      }));
    }).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  onAdvance = () => {
    const { wallet: { user: { role } } } = this.props;
    const { advance } = this.state;
    if (role === 'admin') return this.setState({ advance: !advance });
  }

  render() {
    const { classes } = this.props;
    const { data, advance } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <IconButton color="secondary" onClick={this.onAdvance}>
              <LanguageRounded />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h6" color="primary">Networks</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={advance}>
          <InitializeNetwork />
        </Collapse>
      </Grid>
      {data.map(({ address }, index) => <Grid item xs={12} key={index}>
        <NetworkInfo address={address} />
      </Grid>)}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  network: state.network,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getNetworks, getNetwork,
  setError,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Network)));