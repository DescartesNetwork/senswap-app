import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';

// UI redux helper
import styles from './styles';
import { setScreen, setScroll } from 'modules/ui.reducer';


class UiUx extends Component {

  componentDidMount() {
    this.scrollToHash();
    this.listenResizeEvents();
  }

  componentDidUpdate(prevProps) {
    const { location: { hash } } = this.props;
    const { location: { hash: prevHash } } = prevProps;
    if (!isEqual(prevHash, hash)) this.scrollToHash();
  }

  listenResizeEvents = () => {
    const { setScreen } = this.props;
    setScreen(window.innerWidth); // Init
    return window.onresize = () => {
      return setScreen(window.innerWidth);
    }
  }

  scrollToTop = () => {
    return window.scrollTo(0, 0);
  }

  scrollToHash = () => {
    const { location: { hash } } = this.props;
    if (!hash) return console.warn('Invalid hashtag');
    const id = hash.replace('#', '');
    const ele = window.document.getElementById(id);
    if (!ele) return console.error('Invalid component');
    return setTimeout(() => ele.scrollIntoView(), 300);
  }

  render() {
    return <Fragment />;
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setScreen, setScroll,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(UiUx)));