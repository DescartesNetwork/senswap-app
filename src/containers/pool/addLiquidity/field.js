import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import TextField from 'senswap-ui/textField';
import Divider from 'senswap-ui/divider';
import Link from 'senswap-ui/link';

import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';


class Field extends Component {

  onMax = () => {
    const { accountData: { amount, mint }, onChange } = this.props;
    const { decimals } = mint || {}
    const newAmounts = ssjs.undecimalize(amount, decimals);
    return onChange(newAmounts);
  }

  onChange = (e) => {
    const { onChange } = this.props;
    const value = e.target.value || '';
    return onChange(value);
  }

  render() {
    const { classes, value, accountData: { amount, mint } } = this.props;
    const { symbol, icon, decimals } = mint || {}

    return <Grid container>
      <Grid item xs={12} >
        <TextField
          variant="contained"
          value={value}
          type="number"
          placeholder="0"
          onChange={this.onChange}
          InputProps={{
            startAdornment: <Grid container className={classes.noWrap}>
              <Grid item>
                <Grid container className={classes.noWrap} alignItems="center">
                  <Grid item>
                    <MintAvatar icon={icon} />
                  </Grid>
                  <Grid item>
                    <Typography>{symbol}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Divider orientation="vertical" />
              </Grid>
            </Grid>
          }}
          helperTextPrimary={`Available: ${utils.prettyNumber(ssjs.undecimalize(amount, decimals))} ${symbol || ''}`}
          helperTextSecondary={<Grid container justify="flex-end">
            <Grid item>
              <Link color="primary" variant="body2" onClick={this.onMax}>MAXIMUM</Link>
            </Grid>
          </Grid>}
          fullWidth
        />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

Field.defaultProps = {
  value: '',
  onChange: () => { },
  accountData: {},
}

Field.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  accountData: PropTypes.object,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Field)));