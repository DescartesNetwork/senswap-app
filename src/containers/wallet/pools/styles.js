export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  error: {
    marginTop: -11,
    marginLeft: 14,
    fontSize: 10
  },
  card: {
    transition: theme.transitions.create(),
    '&:hover': {
      boxShadow: theme.shadows[6],
    },
    // background: 'linear-gradient(45deg, hsla(33, 100%, 53%, 1) 0%, hsla(58, 100%, 68%, 1) 100%)'
  },
});
