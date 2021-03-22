import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';

import styles from './styles';
import { getMintData } from 'modules/bucket.reducer';
import { setError } from 'modules/ui.reducer';


const EMPTY_ADDRESS = '11111111111111111111111111111111';

class NetworkAvatar extends Component {
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
    const { mintAddresses: prevMintAddresses } = prevProps;
    const { mintAddresses } = this.props;
    if (!isEqual(mintAddresses, prevMintAddresses)) this.fetchData();
  }

  fetchData = () => {
    const { mintAddresses, getMintData, setError } = this.props;
    const addresses = mintAddresses.filter(mintAddress => {
      return ssjs.isAddress(mintAddress) && mintAddress !== EMPTY_ADDRESS;
    });
    return Promise.all(addresses.map(mintAddress => {
      return getMintData(mintAddress);
    })).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { title, marginRight, onClick } = this.props;
    const { data } = this.state;

    return <Tooltip title={title}>
      <AvatarGroup max={3} onClick={onClick} style={{ marginRight: marginRight ? 8 : 0 }}>
        {data.map(({ icon }, index) => <Avatar key={index} src={icon} className={classes.networkIcon} />)}
      </AvatarGroup>
    </Tooltip>
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

NetworkAvatar.defaultProps = {
  mintAddresses: [],
  title: '',
  marginRight: false,
  onClick: () => { },
}

NetworkAvatar.propTypes = {
  mintAddresses: PropTypes.array,
  title: PropTypes.string,
  marginRight: PropTypes.bool,
  onClick: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NetworkAvatar)));