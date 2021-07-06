import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import ssjs from "senswapjs";

import { withStyles } from "senswap-ui/styles";
import Grid from "senswap-ui/grid";
import Button from "senswap-ui/button";
import Paper from "senswap-ui/paper";
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from "senswap-ui/table";
import Avatar, { AvatarGroup } from "senswap-ui/avatar";
import { HelpOutlineRounded } from 'senswap-ui/icons';
import Typography from 'senswap-ui/typography';

import { setError, setSuccess } from "modules/ui.reducer";
import { getStakePools } from "modules/stakePool.reducer";
import { getAccountData } from "modules/bucket.reducer";
import CircularProgress from "senswap-ui/circularProgress";
import { getPools, getPool } from 'modules/pool.reducer';

import configs from "configs";
import sol from "helpers/sol";

import Farming from "../stakePoolDetail/stakePoolDetail";
import Seed from '../seed';
import styles from "../styles";

const liteFarming = new ssjs.LiteFarming();
const farming = new ssjs.Farming();
const COLS = [
  { label: "#", key: "" },
  { label: "Assets", key: "assets" },
  { label: "Address", key: "address" },
  { label: "APR", key: "apr" },
  { label: "APY", key: "apy" },
  { label: "Liquidity", key: "total_value" },
  { label: "", key: "detail" },
  { label: "", key: "seed" },
];

const DECIMAL = 9;
const LIMIT = 9999;

class StakePool extends Component {
  constructor() {
    super();

    this.state = {
      stakePools: [],
      visible: false,
      poolDetail: [],
      stakeLoading: false,
      unStakeLoading: false,
      loading: false,
      visibleSeed: false,
    };
  }
  componentDidMount() {
    this.fetchStakePools();
  }

  //Combine data to stake pool
  combineStakePool(stakePools, lptIcons) {
    const newStakePools = stakePools.map(stakePool => {
      const { mint_token: { address: stakePoolAddress } } = stakePool;
      const filter = lptIcons.find(({ lptAddress }) => lptAddress === stakePoolAddress);
      if (filter) stakePool = { ...stakePool, ...filter };
      return {
        ...stakePool,
        apr: 0,
        apy: 0,
      };
    });

    return newStakePools;
  }

  fetchStakePools = async () => {
    const { getStakePools } = this.props;
    this.setState({ loading: true });
    try {
      let poolAddresses = await getStakePools({}, LIMIT);
      //Fetch data from blockchain
      const promise = poolAddresses.map(({ address }) => {
        return liteFarming.getStakePoolData(address);
      });
      let poolData = await Promise.all(promise);
      //Fetch pool data to format to list icon
      const lptIcons = await this.fetchPools();
      //Calculate
      poolData = this.combineStakePool(poolData, lptIcons);
      this.setState({ stakePools: poolData, loading: false });
    } catch (er) {
      await setError(er);
    }
  };

  fetchPools = async () => {
    const { getPools, getPool, setError } = this.props;
    try {
      const pools = await getPools();
      const poolData = await Promise.all(pools.map(({ address }) => getPool(address)));
      const formatData = poolData.map(pool => {
        const {
          mintA: { icon: iconA, symbol: symbolA },
          mintB: { icon: iconB, symbol: symbolB },
          mintS: { icon: iconS, symbol: symbolS },
          mintLPT: { address: mintLPTAddress }
        } = pool;
        return {
          lptAddress: mintLPTAddress,
          icons: [iconS, iconA, iconB],
          symbols: [symbolS, symbolA, symbolB],
        }
      })
      return formatData;
    } catch (err) {
      await setError('Invalid pools');
    }
  }

  onClose = () => {
    return this.setState({
      poolDetail: {},
      stakeLoading: false,
      unStakeLoading: false,
      visible: false,
    });
  };

  onOpen = async (stakePool) => {
    if (!stakePool) return;
    const {
      mint_token: { address: mintAddress },
    } = stakePool;
    const wallet = window.senswap.wallet;

    const account = await this.fetchAccountData(mintAddress, wallet);
    console.log("stakePool.address", stakePool.address);
    const debt = await this.fetchDebtData(stakePool.address);
    const poolDetail = {
      pool: stakePool,
      account,
      mint: account.mint,
      debt,
    };
    console.log("poolDetail", poolDetail);
    this.setState({ visible: true, poolDetail: poolDetail });
  };

  fetchDebtData = async (poolAddress) => {
    const wallet = window.senswap.wallet;
    let accountData = null;
    try {
      accountData = await liteFarming.getStakeAccountData(poolAddress, wallet);
    } catch (error) { }
    return accountData;
  };

  fetchAccountData = async (mintAddress) => {
    const {
      wallet: {
        user: { address: userAddress },
      },
      getAccountData,
    } = this.props;
    if (!ssjs.isAddress(mintAddress)) throw new Error("Invalid mint address");
    if (!ssjs.isAddress(userAddress)) throw new Error("Invalid wallet address");
    const { address: accountAddress, state } = await sol.scanAccount(mintAddress, userAddress);
    if (!state) throw new Error("Invalid state");
    const account = await getAccountData(accountAddress);
    return account;
  };

  handleStake = async (amount, address, type) => {
    console.log("amount, address, type", amount, address, type);
    const {
      wallet: {
        user: { address: userAddress },
      },
    } = this.props;
    const {
      poolDetail: {
        pool: { address: stakePoolAddress },
      },
    } = this.state;
    const {
      sol: { senAddress },
    } = configs;
    const { address: LPAddress } = await sol.scanAccount(address, userAddress);
    const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
    const reserveAmount = ssjs.decimalize(amount, DECIMAL);
    const data = {
      reserveAmount,
      stakePoolAddress,
      LPAddress,
      senWallet,
    };
    if (type === "unstake") return this.unstake(data);
    return this.stake(data);
  };

  stake = async (data) => {
    const wallet = window.senswap.wallet;
    this.setState({ stakeLoading: true });
    const { reserveAmount: amount, stakePoolAddress, LPAddress, senWallet } = data;
    try {
      //Check Stake Pool Account
      let accountData = null;
      try {
        accountData = await liteFarming.getStakeAccountData(stakePoolAddress, wallet);
      } catch (error) {
        accountData = await liteFarming.initializeAccount(stakePoolAddress, wallet);
      }
      if (!accountData) return;
      //Stake
      const stake = await liteFarming.stake(amount, stakePoolAddress, LPAddress, senWallet, wallet);
      console.log(stake, "finish stake??");
      await setSuccess("The token has been staked!");
      this.setState({ stakeLoading: false }, () => {
        this.fetchStakePools();
        this.onClose();
      });
    } catch (err) {
      await setError(err);
    }
  };
  unstake = async (data) => {
    this.setState({ unStakeLoading: true });
    const { reserveAmount: amount, stakePoolAddress, LPAddress, senWallet } = data;
    console.log(data, "stake11");
    try {
      const result = await liteFarming.unstake(amount, stakePoolAddress, LPAddress, senWallet, window.senswap.wallet);
      await setSuccess("The token has been unstaked!");
      this.setState({ unStakeLoading: false }, () => {
        this.fetchStakePools();
        this.onClose();
      });
    } catch (err) {
      await setError(err);
    }
  };
  onHandleHarvest = async () => {
    const {
      poolDetail: {
        pool: { address: stakePoolAddress },
      },
    } = this.state;
    const {
      wallet: {
        user: { address: userAddress },
      },
    } = this.props;
    const wallet = window.senswap.wallet;
    const {
      sol: { senAddress },
    } = configs;
    try {
      const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
      const harvest = await liteFarming.harvest(stakePoolAddress, senWallet, wallet);
      console.log(harvest, "harvest");
      await setSuccess("Harvest successfully");
      this.fetchStakePools();
      this.onClose();
    } catch (err) {
      await setError(err);
    }
  };

  onHandleSeed = async (amount, type) => {
    const {
      wallet: {
        user: { address: userAddress },
      },
    } = this.props;
    const {
      poolDetail: {
        pool: { address: stakePoolAddress },
      },
    } = this.state;
    const { sol: { senAddress } } = configs;
    const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
    const reserveAmount = ssjs.decimalize(amount, DECIMAL);
    const data = {
      reserveAmount, stakePoolAddress,
      senWallet
    }

    if (type === 'unseed') return this.unseed(data);
    return this.seed(data);
  }
  seed = async (data) => {
    console.log(data, 'data seed')
    const wallet = window.senswap.wallet;
    const { setSuccess, setError } = this.props;
    const {
      reserveAmount: amount, stakePoolAddress,
      senWallet
    } = data;
    try {
      this.setState({ seedLoading: true });
      const seed = await liteFarming.seed(amount, stakePoolAddress, senWallet, wallet);
      if (!seed) throw new Error('Error!');
      this.setState({ seedLoading: false }, () => {
        this.onCloseSeed();
        this.fetchStakePools();
      });

      await setSuccess('Successfully');

    } catch (err) {
      await setError(err);
    }
  }
  unseed = async (data) => {
    const wallet = window.senswap.wallet;
    const { setSuccess, setError } = this.props;
    const {
      reserveAmount: amount, stakePoolAddress,
      senWallet
    } = data;
    try {
      this.setState({ unSeedLoading: true });
      const seed = await liteFarming.unseed(amount, stakePoolAddress, senWallet, wallet);
      if (!seed) throw new Error('Error!');
      this.setState({ seedLoading: false }, () => {
        this.onCloseSeed();
        this.fetchStakePools();
      });

      await setSuccess('Successfully');

    } catch (err) {
      await setError(err);
    }

  }

  onOpenSeed = async (stakePool) => {
    if (!stakePool) return;
    const {
      mint_token: { address: mintAddress },
    } = stakePool;
    const wallet = window.senswap.wallet;

    const account = await this.fetchAccountData(mintAddress, wallet);
    console.log("stakePool.address", stakePool.address);
    const debt = await this.fetchDebtData(stakePool.address);
    const poolDetail = {
      pool: stakePool,
      account,
      mint: account.mint,
      debt,
    };
    console.log("poolDetail", poolDetail);
    this.setState({ visibleSeed: true, poolDetail: poolDetail });
  }
  onCloseSeed = () => {
    this.setState({
      visibleSeed: false,
      poolDetails: []
    })
  }

  render() {
    const { classes } = this.props;
    const {
      stakePools, visible, poolDetail,
      stakeLoading, unStakeLoading, loading,
      visibleSeed, seedLoading, unSeedLoading
    } = this.state;

    return (
      // <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow style={{ borderBottom: "1px solid #dadada" }}>
                  {COLS.map((e, idx) => {
                    return <TableCell key={idx}>
                      <Typography variant="caption" color="textSecondary" style={{ textTransform: 'uppercase' }}>{e.label}</Typography>
                    </TableCell>;
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading
                  ? stakePools.map((pool, idx) => {
                    const { mint_token: token, address: stakePoolAddress, total_shares, icons, symbols } = pool;
                    return (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className={classes.assets}>
                          <AvatarGroup>
                            {icons ? icons.map((icon, idx) => {
                              return <Avatar src={icon} className={classes.icon} key={idx}>
                                <HelpOutlineRounded />
                              </Avatar>
                            }) : <Avatar />}
                          </AvatarGroup>
                          <Grid item>
                            <Typography>{symbols ? symbols.map((symbol, idx) => {
                              return <Fragment key={idx}>{symbol}{symbol.length > Number(idx + 1) ? ' x ' : ''}</Fragment>
                            }) : null}</Typography>
                          </Grid>
                        </TableCell>
                        <TableCell className={classes.address}>{stakePoolAddress}</TableCell>
                        <TableCell>{pool.apr}%</TableCell>
                        <TableCell>{pool.apy}%</TableCell>
                        <TableCell>{ssjs.undecimalize(total_shares, token.decimals)}</TableCell>
                        {/* Action */}
                        <TableCell className={classes.button}>
                          <Button variant="outlined" onClick={() => this.onOpenSeed(pool)}>Seed</Button>
                        </TableCell>
                        <TableCell className={classes.button}>
                          <Button color="primary" onClick={() => this.onOpen(pool)}>Detail</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                  : [1, 2, 3, 4, 5].map((e) => {
                    return (
                      <TableRow key={e}>
                        {COLS.map((col) => (
                          <TableCell key={col.key}>
                            <CircularProgress size={17} />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        {/* Modal farming */}
        <Farming
          visible={visible}
          onClose={this.onClose}
          stakeLoading={stakeLoading}
          unStakeLoading={unStakeLoading}
          detail={poolDetail}
          onHandleStake={this.handleStake}
          onHandleHarvest={this.onHandleHarvest}
        />
        {/* Modal seed - admin only */}
        <Seed
          visible={visibleSeed}
          onClose={this.onCloseSeed}
          detail={poolDetail}
          seedLoading={seedLoading}
          unSeedLoading={unSeedLoading}
          onHandleSeed={this.onHandleSeed}
        />
      </Grid>
      // </Paper>
    );
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setError,
      setSuccess,
      getStakePools,
      getAccountData,
      getPools,
      getPool,
    },
    dispatch
  );

StakePool.propTypes = {};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(StakePool)));
