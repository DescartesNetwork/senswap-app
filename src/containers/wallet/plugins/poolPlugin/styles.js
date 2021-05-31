// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  icon: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    background: theme.palette.background.secondary,
    color: theme.palette.text.primary,
    cursor: 'pointer',
    boxShadow: theme.shadows[3],
    transition: theme.transitions.create(),
    '&:hover': {
      boxShadow: theme.shadows[6],
    },
  },
  card: {
    borderRadius: theme.shape.borderRadius * 2,
  },
  cardContent: {
    padding: `${theme.spacing(3)}px ${theme.spacing(3)}px ${theme.spacing(2)}px ${theme.spacing(3)}px`,
  },
  cardInfo: {
    padding: `${theme.spacing(1.5)}px ${theme.spacing(3)}px`,
    backgroundColor: theme.palette.background.secondary,
  },
  cardAction: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px !important`,
  },
  dialogAction: {
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  tableRow: {
    cursor: 'pointer',
    transition: theme.transitions.create(),
    '&:hover': {
      backgroundColor: theme.palette.background.secondary,
    },
  },
  recommended: {
    color: theme.palette.success.main
  },
  warning: {
    color: theme.palette.warning.main
  }
});
