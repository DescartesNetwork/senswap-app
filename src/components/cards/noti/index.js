import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { PageviewRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';

import styles from './styles';
import liquid1 from 'static/images/liquid1.jpg';
import liquid2 from 'static/images/liquid2.jpg';
import liquid3 from 'static/images/liquid3.jpg';
import liquid4 from 'static/images/liquid4.jpg';


class NotiCard extends Component {
  constructor() {
    super();

    this.state = {
      backgrounds: [liquid1, liquid2, liquid3, liquid4]
    }
  }

  randBackground = () => {
    const { backgrounds } = this.state;
    const rand = Math.floor(Math.random() * backgrounds.length);
    return backgrounds[rand];
  }

  render() {
    const { classes } = this.props;
    const { title, description, source } = this.props;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={12} style={{ backgroundImage: `url('${this.randBackground()}')` }} className={classes.gallery}>
        <BaseCard variant="fluent">
          <Grid container spacing={2} justify="flex-end">
            <Grid item xs={12}>
              <Typography variant="body2">{title}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>{description}</Typography>
            </Grid>
            <Grid item>
              <Button
                startIcon={<PageviewRounded />}
                component={RouterLink}
                to={source}
              >
                <Typography>Learn more</Typography>
              </Button>
            </Grid>
          </Grid>
        </BaseCard>
      </Grid>
    </Grid>
  }
}

NotiCard.defaultProps = {
  title: '',
  description: '',
  source: '#'
}

NotiCard.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  source: PropTypes.string,
}

export default withRouter(withStyles(styles)(NotiCard));