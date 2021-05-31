import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';
import Avatar from 'senswap-ui/avatar';

const useStyles = makeStyles(theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  paper: {
    padding: theme.spacing(3),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.background.secondary
    },
    transition: theme.transitions.create(),
  },
  subtitle: {
    color: theme.palette.text.disabled,
  },
}));

function FeaturedCard(props) {
  const classes = useStyles();
  const { subtitle, title, src, onClick } = props;

  return <Paper className={classes.paper} onClick={onClick}>
    <Grid container className={classes.noWrap} alignItems="center">
      <Grid item>
        <Avatar src={src} size="medium" />
      </Grid>
      <Grid item>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Typography variant="body2" className={classes.subtitle}>{subtitle}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">{title}</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Paper>
}

FeaturedCard.defaultProps = {
  src: '',
  subtitle: '',
  title: '',
  onClick: () => { },
}

FeaturedCard.propTypes = {
  src: PropTypes.string,
  subtitle: PropTypes.string,
  title: PropTypes.string,
  to: PropTypes.string,
  onClick: PropTypes.func,
}

export default FeaturedCard;