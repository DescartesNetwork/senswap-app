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
import Button, { IconButton } from 'senswap-ui/button';
import Divider from 'senswap-ui/divider';
import Link from 'senswap-ui/link';

import { AddRounded, CancelRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';


class Field extends Component {
  constructor() {
    super();

    this.state = {
      added: false,
    }
  }

  onAdd = () => {
    return this.setState({ added: true });
  }

  onRemove = () => {
    const { onChange } = this.props;
    return this.setState({ added: false }, () => {
      return onChange('');
    });
  }

  onMax = () => {
    const { accountData: { amount, mint }, onChange } = this.props;
    const { decimals } = mint || {}
    const newAmounts = ssjs.undecimalize(amount, decimals);
    return onChange(newAmounts);
  }

  onChange = (e) => {
    const { onChange } = this.props;
    const { added } = this.state;
    const value = e.target.value || '';
    if (!added) return onChange('');
    return onChange(value);
  }

  render() {
    const { classes, value, accountData: { amount, mint } } = this.props;
    const { added } = this.state;

    const { symbol, name, icon, decimals } = mint || {}

    return <Grid container>
      <Grid item xs={12} >
        <TextField
          label={name}
          placeholder={added ? '0' : 'Click Add to input'}
          variant="contained"
          value={added ? value : ''}
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
            </Grid>,
            endAdornment: !added ? <Button color="primary" onClick={this.onAdd} endIcon={<AddRounded />}>
              <Typography>Add</Typography>
            </Button> : <IconButton onClick={this.onRemove} size="small">
              <CancelRounded />
            </IconButton>,
          }}
          readOnly={!added}
          helperTextPrimary={added ? `Available: ${utils.prettyNumber(ssjs.undecimalize(amount, decimals))} ${symbol || ''}` : null}
          helperTextSecondary={added ? <Link color="primary" variant="body2" onClick={this.onMax}>MAXIMUM</Link> : null}
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