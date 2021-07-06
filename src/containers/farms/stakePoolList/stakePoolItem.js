import React, { useEffect } from 'react';
import ssjs from 'senswapjs';
import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Button from 'senswap-ui/button';
import { TableCell, TableRow } from 'senswap-ui/table';
import Avatar, { AvatarGroup } from 'senswap-ui/avatar';
import { HelpOutlineRounded } from 'senswap-ui/icons';
import Typography from 'senswap-ui/typography';
import CircularProgress from 'senswap-ui/circularProgress';
import styles from '../styles';
import { useDispatch, useSelector } from 'react-redux';
import { getStakePoolData } from 'modules/bucket.reducer';

function StakePoolItem(props) {
  const { classes, stakePool, index, onOpenDetail, onOpenSeed } = props;
  const dispatch = useDispatch();
  const poolData = useSelector((state) => state.bucket[stakePool.address]);
  const walletAddr = useSelector((state) => state.wallet.user.address);

  useEffect(() => {
    setTimeout(() => {
      if (!poolData) dispatch(getStakePoolData(stakePool.address));
    }, 500);
  }, []);

  //Check loading
  function renderLoading() {
    return (
      <TableRow>
        {[1, 2, 3, 4, 5, 6, 7].map((elm) => {
          return (
            <TableCell key={elm}>
              <CircularProgress size={17} />
            </TableCell>
          );
        })}
      </TableRow>
    );
  }
  if (!poolData) return renderLoading();

  //Render Stake Pool Element
  const {
    mint_token: token,
    total_shares,
    mintS: { icon: iconS, symbol: symbolS },
    mintA: { icon: iconA, symbol: symbolA },
    mintB: { icon: iconB, symbol: symbolB },
  } = poolData;
  const icons = [iconA, iconB, iconS];
  const name = `${symbolA || '.'} x ${symbolB || '.'} x ${symbolS || '.'}`;

  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell className={classes.assets}>
        <AvatarGroup>
          {icons ? (
            icons.map((icon, idx) => {
              return (
                <Avatar src={icon} className={classes.icon} key={idx}>
                  <HelpOutlineRounded />
                </Avatar>
              );
            })
          ) : (
            <Avatar />
          )}
        </AvatarGroup>
        <Grid item>
          <Typography>{name}</Typography>
        </Grid>
      </TableCell>
      <TableCell>0%</TableCell>
      <TableCell>0%</TableCell>
      <TableCell>{ssjs.undecimalize(total_shares, token.decimals)}</TableCell>
      <TableCell>
        <Button variant="outlined" onClick={() => onOpenSeed(stakePool)} disabled={!walletAddr}>
          Seed
        </Button>
      </TableCell>
      <TableCell>
        <Button color="primary" onClick={() => onOpenDetail(poolData)} disabled={!walletAddr}>
          Detail
        </Button>
      </TableCell>
    </TableRow>
  );
}
export default withStyles(styles)(StakePoolItem);
