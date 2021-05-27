// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  paper: {
    padding: theme.spacing(2)
  },
  icon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    background: theme.palette.background.secondary,
    color: theme.palette.text.primary,
    cursor: 'pointer',
    boxShadow: theme.shadows[3],
    transition: theme.transitions.create(),
    '&:hover': {
      boxShadow: theme.shadows[6],
    },
  },
  unit: {
    fontSize: 12,
    color: '#808191'
  },
  chip: {
    backgroundColor: theme.palette.background.secondary,
    fontSize: 10,
    height: theme.spacing(3)
  }
});