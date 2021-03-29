import ssjs from 'senswapjs';

const Oracle = {}

Oracle.curve = (bidAmount, bidData, askData, bidPrimaryData, askPrimaryData) => {
  return new Promise((resolve, reject) => {
    if (!bidData) return reject('Invalid bid pool data');
    if (!askData) return reject('Invalid ask pool data');
    if (!bidPrimaryData) return reject('Invalid primary pool data');
    if (!askPrimaryData) return reject('Invalid primary pool data');
    if (bidData.state !== 1) return reject('Frozen bid pool');
    if (askData.state !== 1) return reject('Frozen ask pool');
    if (bidPrimaryData.state !== 1) return reject('Frozen primary pool');
    if (askPrimaryData.state !== 1) return reject('Frozen primary pool');
    // Parse data
    const { network: { address: bidNetworkAddress } } = bidData;
    const { network: { address: askNetworkAddress } } = askData;
    // Single network
    if (bidNetworkAddress === askNetworkAddress) return Oracle.pureCurve(bidAmount, bidData, askData, bidPrimaryData).then(data => {
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
    // Hopping
    return Oracle.hop(bidAmount, bidData, askData, bidPrimaryData, askPrimaryData).then(data => {
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
  })
}

Oracle.inverseCurve = (askAmount, bidData, askData, bidPrimaryData, askPrimaryData) => {
  return new Promise((resolve, reject) => {
    if (!bidData) return reject('Invalid bid pool data');
    if (!askData) return reject('Invalid ask pool data');
    if (!bidPrimaryData) return reject('Invalid primary pool data');
    if (!askPrimaryData) return reject('Invalid primary pool data');
    if (bidData.state !== 1) return reject('Frozen bid pool');
    if (askData.state !== 1) return reject('Frozen ask pool');
    if (bidPrimaryData.state !== 1) return reject('Frozen primary pool');
    if (askPrimaryData.state !== 1) return reject('Frozen primary pool');
    // Parse data
    const { network: { address: bidNetworkAddress } } = bidData;
    const { network: { address: askNetworkAddress } } = askData;
    // Single network
    if (bidNetworkAddress === askNetworkAddress) return Oracle.pureInverseCurve(askAmount, bidData, askData, askPrimaryData).then(data => {
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
    // Hopping
    return Oracle.inverseHop(askAmount, bidData, askData, bidPrimaryData, askPrimaryData).then(data => {
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
  });
}

Oracle.pureCurve = (bidAmount, bidData, askData, primaryData) => {
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
    const { reserve: primaryReserve, lpt: primaryLPT } = primaryData;

    if (!bidReserve || !bidLPT) return reject('Outdated bid pool');
    if (!askReserve || !askLPT) return reject('Outdated ask pool');
    if (!primaryReserve || !primaryLPT) return reject('Outdated primary pool');

    // Fee
    if (bidNetworkAddress !== askNetworkAddress) return reject('Unsupported routing');
    const fee = primaryAddress === askMintAddress ? global.BigInt(2500000) : global.BigInt(3000000);

    if (!bidAmount) {
      const slippage = '1';
      const ratio = ssjs.div(bidLPT * askReserve, askLPT * bidReserve);
      return resolve([{
        slippage, ratio, fee,
        bidAmount: global.BigInt(0), askAmount: global.BigInt(0),
        bidData, askData, primaryData,
      }]);
    }

    if (typeof bidAmount !== 'bigint') return reject('Amount must be BigInt');

    const newBidReserve = bidReserve + bidAmount;
    const newAskReserve = ssjs.curve(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const slippage = ssjs.slippage(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const ratio = ssjs.ratio(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const paidAmountWithoutFee = askReserve - newAskReserve;
    const askAmount = paidAmountWithoutFee * (global.BigInt(10 ** 9) - fee) / global.BigInt(10 ** 9);
    return resolve([{
      slippage, ratio, fee,
      bidAmount, askAmount,
      bidData, askData, primaryData
    }]);
  });
}

Oracle.pureInverseCurve = (askAmount, bidData, askData, primaryData) => {
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
    const { reserve: primaryReserve, lpt: primaryLPT } = primaryData;

    if (!bidReserve || !bidLPT) return reject('Outdated bid pool');
    if (!askReserve || !askLPT) return reject('Outdated ask pool');
    if (!primaryReserve || !primaryLPT) return reject('Outdated primary pool');

    // Fee
    if (bidNetworkAddress !== askNetworkAddress) return reject('Unsupported routing');
    const fee = primaryAddress === askMintAddress ? global.BigInt(2500000) : global.BigInt(3000000);

    if (!askAmount) {
      const slippage = '1';
      const ratio = ssjs.div(bidLPT * askReserve, askLPT * bidReserve);
      return resolve([{
        slippage, ratio, fee,
        bidAmount: global.BigInt(0), askAmount: global.BigInt(0),
        bidData, askData, primaryData,
      }]);
    }

    if (typeof askAmount !== 'bigint') return reject('Amount must be BigInt');

    const askAmountWithoutFee = askAmount * global.BigInt(10 ** 9) / (global.BigInt(10 ** 9) - fee);
    const newAskReserve = askReserve - askAmountWithoutFee;
    const newBidReserve = ssjs.inverseCurve(newAskReserve, bidReserve, bidLPT, askReserve, askLPT);
    const slippage = ssjs.slippage(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const ratio = ssjs.ratio(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const bidAmount = newBidReserve - bidReserve + global.BigInt(1);
    return resolve([{
      slippage, ratio, fee,
      bidAmount, askAmount,
      bidData, askData, primaryData
    }]);
  });
}

Oracle.hop = (bidAmount, bidData, askData, bidPrimaryData, askPrimaryData) => {
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
    if (!bidPrimaryData) return reject('Invalid bid primary pool data');
    if (!askPrimaryData) return reject('Invalid ask primary pool data');
    if (bidPrimaryData.state !== 1) return reject('Frozen bid primary pool');
    if (askPrimaryData.state !== 1) return reject('Frozen ask primary pool');

    let data = [{}, {}];
    return Oracle.pureCurve(bidAmount, bidData, bidPrimaryData, bidPrimaryData).then(([re]) => {
      data[0] = re;
      return Oracle.pureCurve(re.askAmount, askPrimaryData, askData, askPrimaryData);
    }).then(([re]) => {
      data[1] = re;
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
  });
}

Oracle.inverseHop = (askAmount, bidData, askData, bidPrimaryData, askPrimaryData) => {
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
    if (!bidPrimaryData) return reject('Invalid bid primary pool data');
    if (!askPrimaryData) return reject('Invalid ask primary pool data');
    if (bidPrimaryData.state !== 1) return reject('Frozen bid primary pool');
    if (askPrimaryData.state !== 1) return reject('Frozen ask primary pool');

    let data = [{}, {}];
    return Oracle.pureInverseCurve(askAmount, askPrimaryData, askData, askPrimaryData).then(([re]) => {
      data[1] = re;
      return Oracle.pureInverseCurve(re.bidAmount, bidData, bidPrimaryData, bidPrimaryData);
    }).then(([re]) => {
      data[0] = re;
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
  });
}

export default Oracle;