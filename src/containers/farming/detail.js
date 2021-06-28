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
        {/* Harvest */}
        <Grid container alignItems="center" spacing={3} wrap="nowrap">
          <Grid item>
            <TextField name="amountHarvest" label="Earned" variant="outlined" value={props.amountHarvest} />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" size="large" disabled={false} fullWidth onClick={() => props.onHarvest(props.data)}>
              <Typography>Harvest</Typography>
            </Button>
          </Grid>
        </Grid>

        {/* Stake */}
        <Grid container alignItems="center" spacing={3} wrap="nowrap">
          <Grid item>
            <TextField name="amountStake" label="LP amount" variant="outlined" value={props.amountStake} />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" size="large" disabled={false} fullWidth onClick={() => props.onStake(props.data)}>
              Stake
            </Button>
          </Grid>
        </Grid>

        {/* Unstake */}
        <Grid container alignItems="center" spacing={3} wrap="nowrap">
          <Grid item>
            <TextField name="amountUnstake" label="LP amount" variant="outlined" value={props.amountUnstake} />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" size="large" disabled={false} fullWidth onClick={() => props.onUnstake(props.data)}>
              Unstake
            </Button>
          </Grid>
        </Grid>

        {/* Seed */}
        <Grid container alignItems="center" spacing={3} >
          <Grid item>
            <TextField name="amountSeed" label="Sen amount" variant="outlined" value={props.amountSeed} />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" size="large" disabled={false} fullWidth onClick={() => props.onSeed(props.data)}>
              Seed
            </Button>
          </Grid>
        </Grid>

        {/* Unseed */}
        <Grid container alignItems="center" spacing={3} wrap="nowrap">
          <Grid item>
            <TextField name="amountUnseed" label="Sen amount" variant="outlined" value={props.amountUnseed} />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" size="large" disabled={false} fullWidth onClick={() => props.onUnseed(props.data)}>
              Unseed
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
