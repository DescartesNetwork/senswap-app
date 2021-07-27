
import sol from 'helpers/sol';


class Farm {
  static bigIntToNumber(bigInt, decimal = 0) {
    return Number(bigInt.toString()) / Math.pow(10, decimal);
  }

  static calculateReward = (pool, debt) => {
    if (debt === null || Object.keys(debt).length === 0 || pool === null) return 0;

    const p = this.bigIntToNumber(pool.reward, 9) / this.bigIntToNumber(pool.total_shares, 9);
    const t = ((Date.now() / 1000) - Number(pool.genesis_timestamp.toString())) / this.bigIntToNumber(pool.period);
    const r_i = this.bigIntToNumber(debt.account.amount, 9);
    const d_i = this.bigIntToNumber(debt.debt, 9);
    const D = this.bigIntToNumber(pool.compensation, 18);

    const reward = p * Math.floor(t) * r_i - d_i + D * r_i;

    return Number(Number(reward).toFixed(8));
  }

  static stake = async (data) => {
    const { wallet, farming: liteFarming } = window.senswap;
    const {
      reserveStake: amount, stakePoolAddress,
      LPAddress, senWallet,
      updateWallet
    } = data;
    try {
      //Check Stake Pool Account
      let newAccount = null;
      try {
        await liteFarming.getStakeAccountData(stakePoolAddress, wallet);
      } catch (error) {
        const { wallet: { stakeAccount } } = data;
        const newAccount = await liteFarming.initializeAccount(stakePoolAddress, wallet);
        stakeAccount.push(newAccount.debtAddress);
        updateWallet({ stakeAccount });
      }
      //Stake
      await liteFarming.stake(amount, stakePoolAddress, LPAddress, senWallet, wallet);
      //Update new stake account to wallet
      if (newAccount) {
        const { wallet: { stakeAccounts } } = data;
        stakeAccounts.push(newAccount.debtAddress);
        updateWallet({ stakeAccounts });
      }
      return { status: true, msg: 'The token has been staked!' };
    } catch (err) {
      return { status: false, msg: err };
    }
  }

  static unstake = async (data) => {
    const liteFarming = window.senswap.farming;
    const { reserveUnstake: amount, stakePoolAddress, LPAddress, senWallet } = data;
    try {
      await liteFarming.unstake(amount, stakePoolAddress, LPAddress, senWallet, window.senswap.wallet);
      return { status: true, msg: 'The token has been unstaked!' };
    } catch (err) {
      return { status: false, msg: err };
    }
  }

  static harvest = async (data) => {
    const { wallet, farming: liteFarming } = window.senswap;
    const { senAddress, userAddress, stakePoolAddress } = data;
    try {
      const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
      await liteFarming.harvest(stakePoolAddress, senWallet, wallet);
      return { status: true, msg: 'Harvest successfully' };
    } catch (err) {
      return { status: false, msg: err };
    }
  }

  static fetchDebtData = async (address) => {
    const { wallet, farming: liteFarming } = window.senswap;
    try {
      const debt = await liteFarming.getStakeAccountData(address, wallet);
      return debt;
    } catch (err) {
      console.log(err)
    }
  }

  static fetchAccountData = async (data) => {
    const { userAddress, getAccountData, mintAddress } = data;
    try {
      const { address: accountAddress, state } = await sol.scanAccount(mintAddress, userAddress);
      if (!state) throw new Error('Invalid state');
      const account = await getAccountData(accountAddress);
      return account;
    } catch (err) {
      console.log(err)
    }
  }

  static getStakePoolAddress = async (data) => {
    const { stakePools, mintAddress } = data;
    try {
      const { address: stakePoolAddress } = stakePools.find(stakePool => stakePool.mintLPT === mintAddress || stakePool.mint_token.address === mintAddress);
      return stakePoolAddress;
    } catch (err) {
      console.log(err)
    }
  }
}

export default Farm;