import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';

import styles from './styles';


class TextInput extends Component {
  constructor(props) {
    super(props);

    this.ref = React.createRef();
  }

  componentDidMount() {
    this.focus();
    this.updateValue();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.readOnly !== this.props.readOnly ||
      prevProps.focus !== this.props.focus
    ) {
      this.focus();
    }
    if (prevProps.value !== this.props.value) {
      this.updateValue();
    }
  }

  focus = () => {
    if (!this.props.readOnly && this.props.focus)
      return this.ref.current.focus();
  }

  updateValue = () => {
    this.ref.current.textContent = this.props.value;
  }

  onInput = (e) => {
    const contents = e.target.textContent;
    this.props.onChange(contents);
  }

  onBlur = (e) => {
    const contents = e.target.textContent;
    this.props.onBlur(contents);
  }

  render() {
    let { classes } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography
          ref={this.ref}
          contentEditable={!this.props.readOnly && !this.props.disabled}
          suppressContentEditableWarning={!this.props.readOnly && !this.props.disabled}
          className={classes.text}
          variant={this.props.variant}
          align={this.props.align}
          onInput={this.onInput}
          onBlur={this.onBlur}
          color={this.props.disabled ? 'textSecondary' : 'textPrimary'}
          placeholder={this.props.placeholder}
        />
      </Grid>
    </Grid>
  }
}

TextInput.defaultProps = {
  value: '',
  placeholder: '',
  variant: 'body1',
  onChange: () => { },
  onBlur: () => { },
  readOnly: false,
  disabled: false,
  focus: false,
}

TextInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  variant: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body1', 'body2']),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  focus: PropTypes.bool,
}

export default withStyles(styles)(TextInput);