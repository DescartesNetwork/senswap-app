import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";

import { DialogContent } from "senswap-ui/dialog";

import Button from "senswap-ui/button";
import { Grid, TextField } from "@material-ui/core";
import Typography from "senswap-ui/typography";

export default function Detail(props) {
  return (
    <Dialog onClose={props.onClose} aria-labelledby="simple-dialog-title" open={props.isOpen}>
      <DialogTitle id="simple-dialog-title">Stake Pool Detail</DialogTitle>
      <DialogContent>
        {/* Havest */}
        <Grid container xs={12} alignItems="center" spacing={3} wrap="nowrap">
          <Grid item>
            <TextField name="amountHavest" label="Earned" variant="outlined" value={props.amountHavest} />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" size="large" disabled={false} fullWidth>
              <Typography>Havest</Typography>
            </Button>
          </Grid>
        </Grid>

        {/* Stake */}
        <Grid container xs={12} alignItems="center" spacing={3} wrap="nowrap">
          <Grid item>
            <TextField name="amountStake" label="LP Amount" variant="outlined" value={props.amountStake} />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" size="large" disabled={false} fullWidth onClick={() => props.onStake(props.data)}>
              Stake
            </Button>
          </Grid>
        </Grid>

        {/* Unstake */}
        <Grid container xs={12} alignItems="center" spacing={3} wrap="nowrap">
          <Grid item>
            <TextField name="amountUnstake" label="LP Amount" variant="outlined" value={props.amountUnstake} />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" size="large" disabled={false} fullWidth onClick={() => props.onUnstake(props.data)}>
              Unstake
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
