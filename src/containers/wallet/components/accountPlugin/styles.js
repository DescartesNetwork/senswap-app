// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  tableRow: {
    cursor: 'pointer',
    transition: theme.transitions.create(),
    '&:hover': {
      backgroundColor: theme.palette.background.secondary,
    }
  },
  paperInSend: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.secondary,
  },
  paperInReceive: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    border: '1px solid rgba(228, 228, 228, 0.1)',
    borderRadius: theme.shape.borderRadius
  }
});
