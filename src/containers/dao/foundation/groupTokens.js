import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Avatar from '@material-ui/core/Avatar';

import styles from './styles';
import { getMintData, getNetworkData } from 'modules/bucket.reducer';
import { setError } from 'modules/ui.reducer';


const EMPTY_ADDRESS = '11111111111111111111111111111111';

class GroupTokens extends Component {
  constructor() {
    super();

    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { mints: prevMints } = prevProps;
    const { mints } = this.props;
    if (!isEqual(mints, prevMints)) this.fetchData();
  }

  fetchData = () => {
    const { network, getNetworkData, getMintData, setError } = this.props;
    return getNetworkData(network).then(({ mints }) => {
      const addresses = mints.filter(mintAddress => {
        return ssjs.isAddress(mintAddress) && mintAddress !== EMPTY_ADDRESS;
      });
      return Promise.all(addresses.map(address => {
        return getMintData(address);
      }));
    }).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { data } = this.state;

    return <AvatarGroup max={3}>
      {data.map(({ address, icon }) => <Avatar key={address} src={icon} alt={address} className={classes.icon} />)}
    </AvatarGroup>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getMintData, getNetworkData,
  setError,
}, dispatch);

GroupTokens.propTypes = {
  network: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(GroupTokens)));