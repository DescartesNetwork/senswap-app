// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  paper: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    border: '1px solid rgba(228, 228, 228, 0.1)',
    borderRadius: theme.shape.borderRadius
  },
  tableRow: {
    cursor: 'pointer',
    transition: theme.transitions.create(),
    '&:hover': {
      backgroundColor: theme.palette.background.secondary,
    },
  },
  formPaper: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    borderRadius: theme.shape.borderRadius / 3,
    backgroundColor: theme.palette.background.secondary,
    width: '100%',
  },
  backdrop: {
    background: 'linear-gradient(163.28deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)',
    backdropFilter: `blur(${theme.spacing(2)}px)`,
    WebkitBackdropFilter: `blur(${theme.spacing(2)}px)`,
    zIndex: theme.zIndex.tooltip + 1,
  }
});
