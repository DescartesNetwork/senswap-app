import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Carousel from 'senswap-ui/carousel';
import Typography from 'senswap-ui/typography';

import FeaturedCard from './featuredCard';

import styles from './styles';
import { setError } from 'modules/ui.reducer';


class FeaturedPool extends Component {
  constructor() {
    super();

    this.state = {
      carouselData: [
        {
          title: "Let's swap with SenSwap",
          description: 'The #1 AMM built on Solana to enrich the proficiency of DeFi ecosystem',
          src: 'https://source.unsplash.com/random',
        },
        {
          title: "About SenSwap Pools",
          description: 'The #1 AMM built on Solana to enrich the proficiency of DeFi ecosystem',
          src: 'https://source.unsplash.com/random',
        }
      ],
      featuredPoolData: [
        {
          subtitle: 'Oct 26th - Nov 25th',
          title: 'BTC x SOL x SEN',
          src: 'https://source.unsplash.com/random',
        },
        {
          subtitle: 'Oct 26th - Nov 25th',
          title: 'BTC x SOL x SEN',
          src: 'https://source.unsplash.com/random',
        },
        {
          subtitle: 'Oct 26th - Nov 25th',
          title: 'BTC x SOL x SEN',
          src: 'https://source.unsplash.com/random',
        }
      ]
    }
  }

  render() {
    const { classes, ui: { width } } = this.props;
    const { carouselData, featuredPoolData } = this.state;

    return <Grid container {...(width >= 600 ? { className: classes.noWrap } : {})}>
      <Grid item {...(width >= 600 ? { className: classes.stretch } : { xs: 12 })}>
        <Carousel data={carouselData} />
      </Grid>
      <Grid item {...(width >= 600 ? { style: { maxWidth: 300 } } : { xs: 12 })}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Featured Pools</Typography>
          </Grid>
          {featuredPoolData.map((data, i) => <Grid item key={i} xs={12}>
            <FeaturedCard {...data} />
          </Grid>)}
        </Grid>
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