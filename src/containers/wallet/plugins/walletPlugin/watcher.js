import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';


class Watcher extends Component {

  componentDidUpdate(prevProps) {
    const { bucket: prevBucket } = prevProps;
    const { addresses, bucket, onChange } = this.props;
    return addresses.forEach(address => {
      if (!isEqual(bucket[address], prevBucket[address])) return onChange(address);
    });
  }

  render() {
    return <Fragment />
  }
}

const mapStateToProps = state => ({
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

Watcher.defaultProps = {
  addresses: [],
  onChange: () => { },
}

Watcher.propTypes = {
  addresses: PropTypes.array,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(Watcher));