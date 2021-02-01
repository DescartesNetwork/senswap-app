import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';

import {
  CloseRounded, ErrorOutlineRounded,
} from '@material-ui/icons';

import Drain from 'components/drain';

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
    const { ui: { error, visible }, unsetError } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Dialog open={visible} onClose={unsetError}>
          <DialogTitle>
            <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
              <Grid item className={classes.stretch}>
                <Typography variant="h6">Error</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={unsetError} edge="end">
                  <CloseRounded />
                </IconButton>
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2} justify="center">
                  <IconButton>
                    <ErrorOutlineRounded color="primary" className={classes.icon} />
                  </IconButton>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Drain small />
              </Grid>
              <Grid item xs={12}>
                <Typography align="center">{error}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2} justify="flex-end">
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={unsetError}
                    >
                      <Typography>OK</Typography>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} /> {/* Safe space */}
            </Grid>
          </DialogContent>
        </Dialog>
      </Grid>
    </Grid>
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