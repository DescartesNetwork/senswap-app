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
    background: 'linear-gradient(163.28deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  }
});