import React, { forwardRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Pagination, EffectCoverflow } from 'swiper';
import PropTypes from 'prop-types';

import { useTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { useStyles } from './styles';

/**
 * Config Swiper
 */
SwiperCore.use([Pagination, EffectCoverflow]);


/**
 * CarouselChild
 * @param {*} props 
 */
const CarouselChild = forwardRef((props, ref) => {
  const { freeMode, ...rest } = props;
  return <SwiperSlide {...rest} ref={ref} style={{ width: freeMode ? 'auto' : '100%' }} />
});

CarouselChild.displayName = 'SwiperSlide';

CarouselChild.defaultProps = {
  freeMode: false,
}

CarouselChild.propTypes = {
  freeMode: PropTypes.bool,
}

export { CarouselChild }


/**
 * Carousel
 * @param {*} props 
 */
function Carousel(props) {
  const theme = useTheme();
  const classes = useStyles();

  const paginationProps = props.pagination && {
    pagination: {
      bulletActiveClass: classes.bullet,
      clickable: true,
      dynamicBullets: true,
    }
  };
  const swiperProps = {
    slidesPerView: !props.slidesPerView ? 'auto' : props.slidesPerView,
    spaceBetween: props.spacing * 8,
    speed: theme.transitions.duration.standard,
    freeMode: props.freeMode,
    slidesPerGroup: Math.max(1, props.slidesPerGroup),
    onSlideChange: e => props.onChange(e.activeIndex),
    direction: props.direction,
    autoHeight: true,
    ...paginationProps,
  }
  return <Grid container spacing={2}>
    <Grid item xs={12}>
      <Swiper {...swiperProps} >
        {props.children}
      </Swiper>
    </Grid>
  </Grid>
}

Carousel.defaultProps = {
  pagination: false,
  centerMode: false,
  slidesPerGroup: 0, // Default: 0 means auto
  slidesPerView: 0,
  freeMode: false,
  spacing: 2,
  onChange: () => { },
  direction: 'horizontal',
}

Carousel.propTypes = {
  pagination: PropTypes.bool,
  centerMode: PropTypes.bool,
  slidesPerGroup: PropTypes.number,
  slidesPerView: PropTypes.number,
  freeMode: PropTypes.bool,
  spacing: PropTypes.number,
  onChange: PropTypes.func,
  direction: PropTypes.oneOf(['horizontal', 'vertical']),
}

export default Carousel;