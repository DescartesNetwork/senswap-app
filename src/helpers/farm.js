
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

    const reward  = p * Math.floor(t) * r_i - d_i + D * r_i;

    return Number(Number(reward).toFixed(8));
  }

  // static calculateAPR() {
  //   return 0;
  // }
}

export default Farm;