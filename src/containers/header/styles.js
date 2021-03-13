export default theme => ({
  noWrap: {
    flexWrap: 'noWrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  logo: {
    cursor: 'pointer'
  },
  subtitle: {
    fontSize: 9,
    marginBottom: -7,
    fontWeight: theme.typography.fontWeightLight,
    color: theme.palette.text.secondary
  },
});