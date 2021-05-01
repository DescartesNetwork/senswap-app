import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Carousel from 'senswap-ui/carousel';

import { } from 'senswap-ui/icons';

import styles from './styles';
import { setError } from 'modules/ui.reducer';


class FeaturedPool extends Component {
  constructor() {
    super();

    this.state = {
      carouselData: [
        {
          title: "Let's Swap with Sen",
          description: 'The #1 AMM built on Solana to enrich the proficiency of DeFi ecosystem',
          src: 'https://source.unsplash.com/random',
        },
        {
          title: "About SenSwap Pools",
          description: 'The #1 AMM built on Solana to enrich the proficiency of DeFi ecosystem',
          src: 'https://source.unsplash.com/random',
        }
      ]
    }
  }

  render() {
    const { classes } = this.props;
    const { carouselData } = this.state;

    return <Grid container className={classes.noWrap}>
      <Grid item className={classes.stretch}>
        <Carousel data={carouselData} />
      </Grid>
      <Grid item>

      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(FeaturedPool)));