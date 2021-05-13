import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, Route, Switch, Redirect, withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Carousel from 'senswap-ui/carousel';
import Drain from 'senswap-ui/drain';

import Header from './header';
import NewPools from './newPools';

import styles from './styles';


class Home extends Component {
  constructor() {
    super();

    this.state = {
      route: '',
      carouselData: [
        {
          title: "Let's swap with SEN",
          description: 'The #1 AMM built on Solana to enrich the proficiency of DeFi ecosystem',
          src: 'https://source.unsplash.com/random',
          action: <Button
            variant="contained"
            color="secondary"
            size="large"
            component={RouterLink}
            to="/swap"
          >
            <Typography>Swap now</Typography>
          </Button>,
        }
      ]
    }
  }

  componentDidMount() {
    this.parseRoute();
  }

  componentDidUpdate(prevProps) {
    const { location: prevLocation } = prevProps;
    const { location } = this.props;
    if (!isEqual(prevLocation, location)) this.parseRoute();
  }

  parseRoute = () => {
    const { location: { pathname } } = this.props;
    const route = pathname.split('/')[2];
    return this.setState({ route })
  }

  render() {
    // const { classes } = this.props;
    const { route, carouselData } = this.state;

    return <Grid container>
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Grid item xs={12}>
        <Drain size={0} />
      </Grid>
      <Grid item xs={12}>
        <Carousel data={carouselData} />
      </Grid>
      <Grid item xs={12}>
        <Drain size={1} />
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item>
            <Button
              component={RouterLink}
              color={route === 'new-pools' ? 'primary' : 'default'}
              to='/home/new-pools'
            >
              <Typography>New</Typography>
            </Button>
          </Grid>
          <Grid item>
            <Button
              component={RouterLink}
              color={route === 'top-swap' ? 'primary' : 'default'}
              to='/home/top-swap'
            >
              <Typography>Top Swap</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Switch>
          <Redirect exact from="/home" to="/home/new-pools" />
          <Route exact path='/home/new-pools' component={NewPools} />
          <Route exact path='/home/top-swap' component={NewPools} />
        </Switch>
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
)(withStyles(styles)(Home)));