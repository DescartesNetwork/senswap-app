// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'noWrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  listItem: {
    color: '#808191',
    borderRadius: theme.shape.borderRadius
  },
  listItemActive: {
    color: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius
  },
  listItemIcon: {
    color: 'inherit',
    minWidth: theme.spacing(5),
  }
});