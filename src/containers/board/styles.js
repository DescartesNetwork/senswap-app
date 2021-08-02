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
    height: `calc(100% - ${theme.spacing(8)}px)`
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
  },
  circle: {
    position: 'relative',
    paddingLeft: theme.spacing(2),
    '& .circle': {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      margin: 'auto',
      width: 10,
      height: 10,
      borderRadius: theme.shape.borderRadius - 2,
    }
  },
  chart: {
    borderRadius: theme.shape.borderRadius * 2,
  },
});
