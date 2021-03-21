import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import { ClearRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import MintAvatar from 'containers/wallet/components/mintAvatar';

import styles from './styles';

class Token extends Component {

  render() {
    const { classes } = this.props;
    const { data: { icon, address, name, symbol }, onDelete, readOnly } = this.props;

    return <BaseCard>
      <Grid container spacing={2} className={classes.noWrap} alignItems="center">
        <Grid item>
          <MintAvatar icon={icon} />
        </Grid>
        <Grid item>
          <Grid container spacing={0} justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="body2">{`${name} - ${symbol}`}</Typography>
            </Grid>
            <Grid item>
              <IconButton size="small" onClick={onDelete} edge="end" disabled={readOnly}>
                <ClearRounded fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
          <Typography className={classes.subtitle}>{address}</Typography>
        </Grid>
      </Grid>
    </BaseCard>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

Token.defaultProps = {
  data: {},
  onDelete: () => { },
  readOnly: false
}

Token.propTypes = {
  data: PropTypes.object,
  onDelete: PropTypes.func,
  readOnly: PropTypes.bool,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Token)));