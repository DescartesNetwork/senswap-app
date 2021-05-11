// eslint-disable-next-line
export default theme => ({
  placeholder: {
    color: theme.palette.text.disabled,
  },
  text: {
    overflowWrap: 'break-word',
    '&:empty::before': {
      content: 'attr(placeholder)',
      color: theme.palette.text.disabled
    }
  }
});