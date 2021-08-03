// eslint-disable-next-line
export default theme => ({
  placeholder: {
    color: theme.palette.text.disabled,
  },
  text: {
    overflowWrap: 'break-word',
    outline: 'none',
    '&:empty::before': {
      content: 'attr(placeholder)',
      color: theme.palette.text.disabled
    }
  }
});