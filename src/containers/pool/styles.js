export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  navigation: {
    borderRadius: theme.shape.borderRadius,
    margin: -theme.spacing(1)
  }
});
