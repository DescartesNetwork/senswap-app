import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
  bullet: {
    opacity: 1,
    background: theme.palette.primary.main,
    transform: 'scale(1) !important'
  }
}));