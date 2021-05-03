import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import { ClearRounded, CheckRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import { getMintData } from 'modules/bucket.reducer';
import { setError } from 'modules/ui.reducer';


const EMPTY_ADDRESS = '11111111111111111111111111111111';

class Token extends Component {
  constructor() {
    super();

    this.state = {
      data: {}
    }
  }

  componentDidMount() {
    return this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { address: prevAddress } = prevProps;
    const { address } = this.props;
    if (!isEqual(address, prevAddress)) this.fetchData();
  }

  fetchData = () => {
    const { address, getMintData, setError } = this.props;
    if (!ssjs.isAddress(address) || address === EMPTY_ADDRESS) return;
    return getMintData(address).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { onDelete, readOnly } = this.props;
    const { data: { icon, address, name, symbol } } = this.state;

    if (!address) return null;
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
                {!readOnly ? <ClearRounded fontSize="small" /> : <CheckRounded fontSize="small" />}
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
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getMintData,
  setError,
}, dispatch);

Token.defaultProps = {
  onDelete: () => { },
  readOnly: false,
}

Token.propTypes = {
  address: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
  readOnly: PropTypes.bool,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Token)));