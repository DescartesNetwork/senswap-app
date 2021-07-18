import React from "react";

import { withStyles } from "senswap-ui/styles";
import Grid from "senswap-ui/grid";
import { IconButton } from "senswap-ui/button";
import { DialogTitle } from "senswap-ui/dialog";
import Typography from "senswap-ui/typography";

import { CloseRounded } from "senswap-ui/icons";

import styles from "../styles";


function NewStakePoolHeader(props) {
  const { classes, onClose } = props;
  return (
    <DialogTitle>
      <Grid container alignItems="center" className={classes.noWrap}>
        <Grid item className={classes.stretch}>
          <Typography variant="subtitle1">New stake pool</Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={onClose} edge="end">
            <CloseRounded />
          </IconButton>
        </Grid>
      </Grid>
    </DialogTitle>
  );
}
export default withStyles(styles)(NewStakePoolHeader);
