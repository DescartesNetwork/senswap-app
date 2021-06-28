import api from "helpers/api";
import ssjs from "senswapjs";
import sol from "../../helpers/sol";

const apiBase = "http://localhost:3001";
const liteFarming = new ssjs.LiteFarming(undefined, undefined, undefined, "https://api.devnet.solana.com");

const MINT_SEN_ADDR = "5YwUkPdXLoujGkZuo9B4LsLKj3hdkDcfP4derpspifSJ";
const MINT_BTC_ADDR = "27hdcZv7RtuMp75vupThR3T4KLsL61t476eosMdoec4c";


// try {
//     await liteFarming.getStakeAccountData(stakePoolAddress, wallet);
// } catch (error) {

// }
export default class FarmingService {
  static async createStakePool() {
    const wallet = window.senswap.wallet;

    const ownerAddress = await wallet.getAccount();

    const reward = 1n;
    const period = 5n;
    const mintTokenAddress = MINT_BTC_ADDR;

    const stakePool = await liteFarming.initializeStakePool(reward, period, ownerAddress, mintTokenAddress, MINT_SEN_ADDR, wallet);
    console.log("stakePool", stakePool);
    return api.post(apiBase + "/stake-pool", {
      stakePool: {
        address: stakePool.stakePoolAddress,
        mintShare: stakePool.mintShareAddress,
      },
    });
  }

  static async stake(amount, stakePool) {
    const wallet = window.senswap.wallet;
    const walletAddress = await wallet.getAccount();

    const stakePoolAddress = stakePool.address;
    console.log("stakePool", stakePool);
    let LPAddress = await sol.scanAccount(MINT_BTC_ADDR, walletAddress);
    const srcAddress = LPAddress.address;

    let senWallet = await sol.scanAccount(MINT_SEN_ADDR, walletAddress);
    const dstSenAddress = senWallet.address;

    //TEST
    // if (true) {
    //   await liteFarming.initializeAccount(stakePoolAddress, wallet);
    // }

    // console.log("stakePool", stakePool);
    console.log("stakePoolAddress, srcAddress, dstSenAddress,", stakePoolAddress, srcAddress, dstSenAddress);
    const stake = await liteFarming.stake(10n, stakePoolAddress, srcAddress, dstSenAddress, wallet);
    console.log("2", stake);
  }

  static async unstake(amount, stakePool) {
    const wallet = window.senswap.wallet;
    const walletAddress = await wallet.getAccount();

    const stakePoolAddress = stakePool.address;

    let LPAddress = await sol.scanAccount(MINT_BTC_ADDR, walletAddress);
    const srcAddress = LPAddress.address;

    let senWallet = await sol.scanAccount(MINT_SEN_ADDR, walletAddress);
    const dstSenAddress = senWallet.address;

    //Test admin
    // await liteFarming.seed(89999999900n, stakePoolAddress, senWallet.address, wallet);

    // console.log("stakePool", stakePool);
    console.log("stakePoolAddress, srcAddress, dstSenAddress", stakePoolAddress, srcAddress, dstSenAddress);
    const stake = await liteFarming.unstake(1n, stakePoolAddress, srcAddress, dstSenAddress, wallet);
    console.log("unstake", stake);
  }

  static async harvest(stakePool) {
    const wallet = window.senswap.wallet;
    const walletAddress = await wallet.getAccount();

    const stakePoolAddress = stakePool.address;

    let senWallet = await sol.scanAccount(MINT_SEN_ADDR, walletAddress);
    const dstSenAddress = senWallet.address;

    console.log("dstSenAddress", dstSenAddress)
    const harvest = await liteFarming.harvest(stakePoolAddress, dstSenAddress, wallet);
    console.log("harvest", harvest);
  }

  static async fetchStakePools() {
    const stakePools = await api.get(apiBase + "/stake-pools").then((res) => res.data);
    const promise = [];

    for (const pool of stakePools) {
      promise.push(liteFarming.getStakePoolData(pool.address));
    }
    await Promise.all(promise).then((result) => {
      for (const idx in stakePools) {
        stakePools[idx] = result[idx];
      }
    });
    return stakePools;
  }

  static async seed(amount, stakePool) {
    const wallet = window.senswap.wallet;
    const walletAddress = await wallet.getAccount();
    const stakePoolAddress = stakePool.address;

    let senWallet = await sol.scanAccount(MINT_SEN_ADDR, walletAddress);
    const srcSenAddress = senWallet.address;

    console.log("stakePoolAddress, srcSenAddress", stakePoolAddress, srcSenAddress);
    try {
      const seed = await liteFarming.seed(10000000000n, stakePoolAddress, srcSenAddress, wallet);

      console.log('Seeded: ', seed);
      console.log("StakePool after seeding", stakePool);
    } catch (err) {
      console.error(err.all);
    }
  }

  static async unseed(amount, stakePool) {
    const wallet = window.senswap.wallet;
    const walletAddress = await wallet.getAccount();
    const stakePoolAddress = stakePool.address;

    let senWallet = await sol.scanAccount(MINT_SEN_ADDR, walletAddress);
    const dstSenAddress = senWallet.address;

    console.log("stakePoolAddress, dstSenAddress", stakePoolAddress, dstSenAddress);
    try {
      const unseed = await liteFarming.unseed(1000000000n, stakePoolAddress, dstSenAddress, wallet);
      console.log('Unseed: ', unseed);
    }
    catch (err) {
      console.error(err.all);
    }
  }
}
