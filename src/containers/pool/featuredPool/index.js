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
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';

import HomeHeroImage from 'static/images/home-hero.png';
import FeaturedPoolImage1 from 'static/images/featured-pool-1.png';
import FeaturedPoolImage2 from 'static/images/featured-pool-2.png';
import FeaturedPoolImage3 from 'static/images/featured-pool-3.png';


class FeaturedPool extends Component {
  constructor() {
    super();

    this.state = {
      carouselData: [
        {
          title: "About SenSwap Pools",
          description: 'Get into a pool as simple as making a cup of instant coffee. You only need to add a single token (single-sided liquidity). Then, enjoy your time with SenSwap.',
          src: HomeHeroImage,
        }
      ],
      featuredPoolData: [
        {
          subtitle: utils.prettyDatetime(new Date()),
          title: 'BTC x SOL x SEN',
          src: FeaturedPoolImage1,
        },
        {
          subtitle: utils.prettyDatetime(new Date()),
          title: 'BTC x SOL x SEN',
          src: FeaturedPoolImage2,
        },
        {
          subtitle: utils.prettyDatetime(new Date()),
          title: 'BTC x SOL x SEN',
          src: FeaturedPoolImage3,
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