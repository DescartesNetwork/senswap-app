import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

// Static component
import Header from 'containers/header';
import UiUx from 'containers/uiux';
import Drain from 'components/drain';
// Pages
import NotFound from 'containers/404';
import Home from 'containers/home';

// CSS
import theme from 'static/styles/theme';
import 'static/styles/index.css';
import styles from './styles';


class App extends Component {

  render() {
    const { classes } = this.props;
    return <ThemeProvider theme={theme}>
      <Grid container justify="center" spacing={2}>
        <Grid item xs={12} className={classes.safe} /> {/* Safe space */}
        <Grid item xs={12}>
          <Header />
        </Grid>
        <Grid item xs={12}>
          <Drain small />
        </Grid>
        {/* Pages */}
        <Grid item xs={12}>
          <Switch>
            <Redirect exact from="/" to="/home" />
            <Route exact path='/home' component={Home} />
            <Route exact path='*' component={NotFound} />
          </Switch>
        </Grid>
        {/* Hidden application */}
        <Grid item xs={12} >
          <UiUx />
        </Grid>
      </Grid>
    </ThemeProvider>
  }
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(App)));
