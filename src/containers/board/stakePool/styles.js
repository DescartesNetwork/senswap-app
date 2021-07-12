// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  paper: {
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
  },
  button: {
    textAlign: 'right',
    '& button': {
      padding: theme.spacing(1),
      textTransform: 'capitalize',
      '&:nth-of-type(2)': {
        marginLeft: 14,
      }
    },
  },
  formPaper: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius / 3,
    backgroundColor: theme.palette.background.secondary,
    // width: '100%',
  },
  outlineInput: {
    border: '1px solid',
    borderColor: theme.palette.border.default,
    borderRadius: theme.shape.borderRadius / 3,
    padding: `${theme.spacing(1)}px ${theme.spacing(1) + 2}px`,
    alignItems: 'center',
    '& input': {
      textAlign: 'right',
      padding: `${theme.spacing(0)} ${theme.spacing(2)}px`
    }
  },
});