// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  paper: {
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.background.secondary,
    padding: theme.spacing(2)
  },
  iconButton: {
    backgroundColor: theme.palette.common.black
  },
});
