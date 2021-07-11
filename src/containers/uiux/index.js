import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui//typography';
import CircularProgress from 'senswap-ui//circularProgress';
import Link from 'senswap-ui/link';

import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import Backdrop from '@material-ui/core/Backdrop';

import styles from './styles';
import { setScreen, setScroll, unsetError, unsetSuccess } from 'modules/ui.reducer';


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

  onUnsetError = () =>{
    const {
      ui: {
        error: { visible: errorVisible },
      },
      unsetError
    } = this.props;
    if(errorVisible) unsetError();
  }

  onUnsetSuccess = () =>{
    const {
      ui: {
        success: {visible: successVisible},
      }, unsetSuccess
    } = this.props;
    if(successVisible) unsetSuccess();
  }

  render() {
    const { classes } = this.props;
    const {
      ui: {
        error: { message: errorMsg, visible: errorVisible },
        success: { message: successMsg, visible: successVisible, link: successLink },
        loading
      },
      unsetError, unsetSuccess
    } = this.props;

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
        <Snackbar open={errorVisible} onClose={this.onUnsetError} autoHideDuration={10000}>
          <Alert severity="error" onClose={unsetError} >
            <Typography>{errorMsg}</Typography>
          </Alert>
        </Snackbar>
        {/* Success dialog */}
        <Snackbar open={successVisible} onClose={this.onUnsetSuccess} autoHideDuration={10000}>
          <Alert severity="success" onClose={unsetSuccess} >
            {successLink ? <Link href={successLink} style={{ color: '#edf7ed' }}>{successMsg} - check it out!</Link> :
              <Typography>{successMsg}</Typography>}
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
  setScreen, setScroll, unsetError, unsetSuccess
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(UiUx)));