export default theme => ({
  noWrap: {
    flexWrap: 'noWrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeightLight,
    color: theme.palette.text.secondary
  },
  icon: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    background: '#ffffff',
    color: theme.palette.text.primary,
    cursor: 'pointer',
  },
});