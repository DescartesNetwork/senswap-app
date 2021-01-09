import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';

import { InfoRounded, Facebook, Twitter } from '@material-ui/icons';

import Drain from 'components/drain';
import { BaseCard } from 'components/cards';

import styles from './styles';


class Faucet extends Component {
  constructor() {
    super();

    this.state = {
      link: ''
    }
  }

  onLink = (e) => {
    const link = e.target.value || '';
    return this.setState({ link });
  }

  render() {
    const { classes } = this.props;
    const { link } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} md={10}>
        <Grid container justify="center" spacing={2}>
          <Grid item xs={12} md={8}>
            <BaseCard>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h4">SenFaucet</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>You will receive a little amount of desired token to test. Be aware that these tokens are valueless.</Typography>
                  <Typography>Please spread this great function to other people and then paste the link to execute an airdrop. 🚀</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
                    <Grid item>
                      <IconButton color="secondary">
                        <Facebook />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <IconButton color="secondary">
                        <Twitter />
                      </IconButton>
                    </Grid>
                    <Grid item className={classes.stretch}>
                      <TextField
                        label="Social link"
                        variant="outlined"
                        value={link}
                        onChange={this.onLink}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </BaseCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Faucet)));