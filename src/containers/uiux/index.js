import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

import { } from '@material-ui/icons';

import styles from './styles';
import { setScreen, setScroll, unsetError } from 'modules/ui.reducer';


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
    const { classes } = this.props;
    const { ui: { error, visible, loading }, unsetError } = this.props;

    return <Grid container spacing={2}>
      {/* Loading backdrop */}
      <Grid item xs={12}>
        <Backdrop className={classes.backdrop} open={loading} transitionDuration={500}>
          <Grid container spacing={2} justify="center">
            <Grid item>
              <CircularProgress color="primary" />
            </Grid>
            <Grid item xs={12}>
              <Typography align="center">Loading data please wait</Typography>
            </Grid>
          </Grid>
        </Backdrop>
        {/* Error dialog */}
        <Snackbar open={visible} onClose={unsetError} autoHideDuration={6000}>
          <Alert severity="error" onClose={unsetError} >
            <Typography>{error}</Typography>
          </Alert>
        </Snackbar>
      </Grid>
    </Grid >
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setScreen, setScroll, unsetError
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(UiUx)));