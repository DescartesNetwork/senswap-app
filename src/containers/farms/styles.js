// eslint-disable-next-line
export default (theme) => ({
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
    color: '#808191',
  },
  chip: {
    backgroundColor: theme.palette.background.secondary,
    fontSize: 10,
    height: theme.spacing(3),
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
    },
  },
  chart: {
    borderRadius: theme.shape.borderRadius * 2,
  },
  address: {
    maxWidth: 150,
    textOverflow: 'ellipsis',
    whiteSpaceL: 'nowrap',
    overflow: 'hidden',
  },
  assets: {
    minWidth: 180,
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    textAlign: 'right',
    '& button': {
      padding: theme.spacing(1),
      textTransform: 'capitalize',
      '&:nth-of-type(2)': {
        marginLeft: 14,
      },
    },
  },
  formPaper: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius / 3,
    backgroundColor: theme.palette.background.secondary,
    // width: '100%',
  },
  backdrop: {
    background: 'linear-gradient(163.28deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)',
    backdropFilter: `blur(${theme.spacing(2)}px)`,
    WebkitBackdropFilter: `blur(${theme.spacing(2)}px)`,
    zIndex: theme.zIndex.tooltip + 1,
  },
  outlineInput: {
    border: '1px solid',
    borderColor: theme.palette.border.default,
    borderRadius: theme.shape.borderRadius / 3,
    padding: `${theme.spacing(1)}px ${theme.spacing(1) + 2}px`,
    alignItems: 'center',
    '& input': {
      textAlign: 'right',
      padding: `${theme.spacing(0)} ${theme.spacing(2)}px`,
    },
  },
  amount: {
    marginLeft: theme.spacing(2),
    marginRight: 4,
    color: '#ff3122',
    fontWeight: 'bold',
  },
  columnIndex: {
    width: 0
  },
  label: {
    display: 'flex',
  }
});
