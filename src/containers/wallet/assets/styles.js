// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  paper: {
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 2,
  },
  chip: {
    '& span': {
      backgroundColor: '#00e5ff',
    },
    backgroundColor: '#00e5ff',
    padding: 6,
    fontSize: 16,
  },
  paperInCreateAccount: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.secondary,
  },
});
