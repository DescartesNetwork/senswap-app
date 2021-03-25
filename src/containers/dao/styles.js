export default theme => ({
  noWrap: {
    flexWrap: 'noWrap',
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
  subtitle: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeightLight,
    color: theme.palette.text.secondary
  },
  network: {
    backgroundColor: theme.palette.grey[200],
    borderRadius: theme.shape.borderRadius,
  },
  card: {
    transition: theme.transitions.create(),
    '&:hover': {
      boxShadow: theme.shadows[6],
    },
  },
});