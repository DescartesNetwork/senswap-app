export default theme => ({
  materialPaper: {
    padding: theme.spacing(2),
    width: `calc(100% - ${theme.spacing(4)}px)`,
    transition: theme.transitions.create(),
    '&:hover': {
      boxShadow: theme.shadows[4],
    },
  },
  fluentPaper: {
    padding: theme.spacing(2),
    width: `calc(100% - ${theme.spacing(4)}px)`,
    transition: theme.transitions.create(),
    '&:hover': {
      boxShadow: theme.shadows[4],
    },
    backgroundColor: theme.palette.background.paper + '9',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  }
});