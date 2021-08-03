// eslint-disable-next-line
export default theme => ({
  placeholder: {
    color: theme.palette.text.disabled,
  },
  text: {
    overflowWrap: 'break-word',
    outline: 'none',
    fontWeight: 600,
    '&:empty::before': {
      content: 'attr(placeholder)',
      color: theme.palette.text.disabled
    }
  }
});