import ssjs from 'senswapjs';

const Oracle = {}

Oracle.curve = (bidAmount, bidData, askData, getPoolData) => {
  return new Promise((resolve, reject) => {
    if (!bidAmount || typeof bidAmount !== 'bigint') return reject('Invalid bid amount');
    if (!bidData) return reject('Invalid bid pool data');
    if (!askData) return reject('Invalid ask pool data');
    if (bidData.state !== 1) return reject('Frozen bid pool');
    if (askData.state !== 1) return reject('Frozen ask pool');

    const { network: { address: bidNetworkAddress } } = bidData;
    const { network: { address: askNetworkAddress } } = askData;
    if (bidNetworkAddress === askNetworkAddress) return Oracle.pureCurve(bidAmount, bidData, askData).then(data => {
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
    return reject('Unsupported routing');
    // return Oracle.hop(bidAmount, bidData, askData, getPoolData).then(data => {
    //   return resolve(data);
    // }).catch(er => {
    //   return reject(er);
    // });
  })
}

Oracle.inverseCurve = (askAmount, bidData, askData, getPoolData) => {
  return new Promise((resolve, reject) => {
    if (!askAmount || typeof askAmount !== 'bigint') return reject('Invalid ask amount');
    if (!bidData) return reject('Invalid bid pool data');
    if (!askData) return reject('Invalid ask pool data');
    if (bidData.state !== 1) return reject('Frozen bid pool');
    if (askData.state !== 1) return reject('Frozen ask pool');

    const { network: { address: bidNetworkAddress } } = bidData;
    const { network: { address: askNetworkAddress } } = askData;
    if (bidNetworkAddress === askNetworkAddress) return Oracle.pureInverseCurve(askAmount, bidData, askData).then(data => {
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
    return reject('Unsupported routing');
    // return Oracle.inverseHop(askAmount, bidData, askData, getPoolData).then(data => {
    //   return resolve(data);
    // }).catch(er => {
    //   return reject(er);
    // });
  });
}

Oracle.pureCurve = (bidAmount, bidData, askData) => {
  return new Promise((resolve, reject) => {
    const {
      network: { address: bidNetworkAddress },
      reserve: bidReserve, lpt: bidLPT
    } = bidData;
    const {
      network: { address: askNetworkAddress, primary: { address: primaryAddress } },
      mint: { address: askMintAddress },
      reserve: askReserve, lpt: askLPT
    } = askData;

    if (!bidReserve || !bidLPT) return reject('Outdated bid pool');
    if (!askReserve || !askLPT) return reject('Outdated ask pool');

    // Fee
    if (bidNetworkAddress !== askNetworkAddress) return reject('Unsupported routing');
    const fee = primaryAddress === askMintAddress ? global.BigInt(2500000) : global.BigInt(3000000);

    const newBidReserve = bidReserve + bidAmount;
    const newAskReserve = ssjs.curve(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const slippage = ssjs.slippage(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const ratio = ssjs.ratio(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const paidAmountWithoutFee = askReserve - newAskReserve;
    const amount = paidAmountWithoutFee * (global.BigInt(10 ** 9) - fee) / global.BigInt(10 ** 9);
    return resolve([{ slippage, ratio, amount, fee }]);
  });
}

Oracle.pureInverseCurve = (askAmount, bidData, askData) => {
  return new Promise((resolve, reject) => {
    const {
      network: { address: bidNetworkAddress },
      reserve: bidReserve, lpt: bidLPT
    } = bidData;
    const {
      network: { address: askNetworkAddress, primary: { address: primaryAddress } },
      mint: { address: askMintAddress },
      reserve: askReserve, lpt: askLPT
    } = askData;

    if (!bidReserve || !bidLPT) return reject('Outdated bid pool');
    if (!askReserve || !askLPT) return reject('Outdated ask pool');

    // Fee
    if (bidNetworkAddress !== askNetworkAddress) return reject('Unsupported routing');
    const fee = primaryAddress === askMintAddress ? global.BigInt(2500000) : global.BigInt(3000000);

    const askAmountWithoutFee = askAmount * global.BigInt(10 ** 9) / (global.BigInt(10 ** 9) - fee);
    const newAskReserve = askReserve - askAmountWithoutFee;
    const newBidReserve = ssjs.inverseCurve(newAskReserve, bidReserve, bidLPT, askReserve, askLPT);
    const slippage = ssjs.slippage(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const ratio = ssjs.ratio(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const amount = newBidReserve - bidReserve;
    return resolve([{ slippage, ratio, amount, fee }]);
  });
}

Oracle.hop = (bidAmount, bidData, askData, getPoolData) => {
  return new Promise((resolve, reject) => {
    const {
      network: { primary: { address: bidPrimaryAddress } },
      reserve: bidReserve, lpt: bidLPT
    } = bidData;
    const {
      network: { primary: { address: askPrimaryAddress } },
      reserve: askReserve, lpt: askLPT
    } = askData;

    if (!bidReserve || !bidLPT) return reject('Outdated bid pool');
    if (!askReserve || !askLPT) return reject('Outdated ask pool');
    if (bidPrimaryAddress !== askPrimaryAddress) return reject('Unsupported routing');

    let bidPrimaryData = {}
    let askPrimaryData = {}
    let data = [{}, {}];
    return getPoolData(bidPrimaryAddress).then(re => {
      bidPrimaryData = re;
      return getPoolData(askPrimaryAddress);
    }).then(re => {
      askPrimaryData = re;
      if (!bidPrimaryData) return reject('Invalid bid primary pool data');
      if (!askPrimaryData) return reject('Invalid ask primary pool data');
      if (bidPrimaryData.state !== 1) return reject('Frozen bid primary pool');
      if (askPrimaryData.state !== 1) return reject('Frozen ask primary pool');
      return Oracle.pureCurve(bidAmount, bidData, bidPrimaryData);
    }).then(re => {
      data[0] = re;
      return Oracle.pureCurve(re.amount, askPrimaryData, askData);
    }).then(re => {
      data[1] = re;
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
  });
}

Oracle.inverseHop = (askAmount, bidData, askData, getPoolData) => {
  return new Promise((resolve, reject) => {
    const {
      network: { primary: { address: bidPrimaryAddress } },
      reserve: bidReserve, lpt: bidLPT
    } = bidData;
    const {
      network: { primary: { address: askPrimaryAddress } },
      reserve: askReserve, lpt: askLPT
    } = askData;

    if (!bidReserve || !bidLPT) return reject('Outdated bid pool');
    if (!askReserve || !askLPT) return reject('Outdated ask pool');
    if (bidPrimaryAddress !== askPrimaryAddress) return reject('Unsupported routing');

    let bidPrimaryData = {}
    let askPrimaryData = {}
    let data = [{}, {}];
    return getPoolData(bidPrimaryAddress).then(re => {
      bidPrimaryData = re;
      return getPoolData(askPrimaryAddress);
    }).then(re => {
      askPrimaryData = re;
      if (!bidPrimaryData) return reject('Invalid bid primary pool data');
      if (!askPrimaryData) return reject('Invalid ask primary pool data');
      if (bidPrimaryData.state !== 1) return reject('Frozen bid primary pool');
      if (askPrimaryData.state !== 1) return reject('Frozen ask primary pool');
      return Oracle.pureInverseCurve(askAmount, askPrimaryData, askData);
    }).then(re => {
      data[1] = re;
      return Oracle.pureInverseCurve(re.amount, bidData, bidPrimaryData);
    }).then(re => {
      data[0] = re;
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
  });
}

export default Oracle;