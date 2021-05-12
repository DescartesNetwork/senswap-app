// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  headerText: {
    color: 'transparent',
    background: 'linear-gradient(90deg, hsla(333, 100%, 53%, 1) 0%, hsla(33, 94%, 57%, 1) 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text'
  },
  paperInReceive: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    border: '1px solid rgba(228, 228, 228, 0.1)',
    borderRadius: theme.shape.borderRadius
  },
});