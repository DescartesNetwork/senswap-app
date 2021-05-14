import ssjs from 'senswapjs';
import configs from 'configs';

const ZERO = global.BigInt(0);
const FEE = global.BigInt(2500000);
const EARN = global.BigInt(500000);
const FEE_DECIMALS = global.BigInt(1000000000);

const Oracle = {}

Oracle.rake = (deltaS, deltaA, deltaB, reserveS, reserveA, reserveB, reserveLPT) => {
  return new Promise((resolve, reject) => {
    if (!deltaS && !deltaA && !deltaB) return reject('Invalid amounts');
    if (!reserveS || !reserveA || !reserveB) return reject('Outdated pool');
    const data = ssjs.rake(deltaS, deltaA, deltaB, reserveS, reserveA, reserveB, reserveLPT);
    return resolve(data);
  });
}

Oracle.curve = (bidAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData) => {
  return new Promise((resolve, reject) => {
    if (typeof bidAmount !== 'bigint') return reject('Amount must be BigInt');
    if (!ssjs.isAddress(srcMintAddress)) return reject('Invalid source mint address');
    if (!bidPoolData) return reject('Invalid bid pool data');
    if (bidPoolData.state !== 1) return reject('Frozen bid pool');
    if (!ssjs.isAddress(dstMintAddress)) return reject('Invalid destination mint address');
    if (!askPoolData) return reject('Invalid ask pool data');
    if (askPoolData.state !== 1) return reject('Frozen ask pool');
    // Parse data
    const { address: bidPoolAddress } = bidPoolData;
    const { address: askPoolAddress } = askPoolData;
    // Shared pool
    if (bidPoolAddress === askPoolAddress) return Oracle._directCurve(
      bidAmount, srcMintAddress, dstMintAddress, bidPoolData
    ).then(data => {
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
    // Routing - Shared SEN
    return Oracle._routingCurve(
      bidAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData
    ).then(data => {
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
  });
}

Oracle.inverseCurve = (askAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData) => {
  return new Promise((resolve, reject) => {
    if (typeof askAmount !== 'bigint') return reject('Amount must be BigInt');
    if (!ssjs.isAddress(srcMintAddress)) return reject('Invalid source mint address');
    if (!bidPoolData) return reject('Invalid bid pool data');
    if (bidPoolData.state !== 1) return reject('Frozen bid pool');
    if (!ssjs.isAddress(dstMintAddress)) return reject('Invalid destination mint address');
    if (!askPoolData) return reject('Invalid ask pool data');
    if (askPoolData.state !== 1) return reject('Frozen ask pool');
    // Parse data
    const { address: bidPoolAddress } = bidPoolData;
    const { address: askPoolAddress } = askPoolData;
    // Shared pool
    if (bidPoolAddress === askPoolAddress) return Oracle._inverseDirectCurve(
      askAmount, srcMintAddress, dstMintAddress, askPoolData
    ).then(data => {
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
    // Routing - Shared SEN
    return Oracle._inverseRoutingCurve(
      askAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData
    ).then(data => {
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
  });
}

Oracle._parseReserve = (mintAddress, poolData) => {
  const {
    mint_s: { address: mintAddressS }, reserve_s,
    mint_a: { address: mintAddressA }, reserve_a,
    mint_b: { address: mintAddressB }, reserve_b,
  } = poolData;
  if (mintAddress === mintAddressS) return reserve_s;
  if (mintAddress === mintAddressA) return reserve_a;
  if (mintAddress === mintAddressB) return reserve_b;
}

Oracle._directCurve = (bidAmount, srcMintAddress, dstMintAddress, poolData) => {
  return new Promise((resolve, reject) => {
    const bidReserve = Oracle._parseReserve(srcMintAddress, poolData);
    const askReserve = Oracle._parseReserve(dstMintAddress, poolData);

    if (!bidReserve || !askReserve) return reject('Outdated pool');

    // Fee
    const { sol: { senAddress } } = configs;
    const fee = dstMintAddress === senAddress ? FEE : FEE + EARN;

    // Default state
    if (!bidAmount) {
      const slippage = ZERO;
      const ratio = ssjs.div(askReserve, bidReserve);
      return resolve([{
        slippage, ratio, fee,
        bidAmount: ZERO, askAmount: ZERO,
        srcMintAddress, dstMintAddress, poolData,
      }]);
    }
    // Curving
    const askAmount = ssjs.curve(bidAmount, bidReserve, askReserve, fee, FEE_DECIMALS);
    const slippage = ssjs.slippage(bidAmount, bidReserve, askReserve, fee, FEE_DECIMALS);
    const ratio = ssjs.div(askAmount, bidAmount);
    return resolve([{
      slippage, ratio, fee,
      bidAmount, askAmount,
      srcMintAddress, dstMintAddress, poolData,
    }]);
  });
}

Oracle._inverseDirectCurve = (askAmount, srcMintAddress, dstMintAddress, poolData) => {
  return new Promise((resolve, reject) => {
    const bidReserve = Oracle._parseReserve(srcMintAddress, poolData);
    const askReserve = Oracle._parseReserve(dstMintAddress, poolData);

    if (!bidReserve || !askReserve) return reject('Outdated pool');
    if (askAmount > askReserve) return reject('Cannot buy an amount larger than the available reserve');

    // Fee
    const { sol: { senAddress } } = configs;
    const fee = dstMintAddress === senAddress ? FEE : FEE + EARN;

    // Default state
    if (!askAmount) {
      const slippage = ZERO;
      const ratio = ssjs.div(askReserve, bidReserve);
      return resolve([{
        slippage, ratio, fee,
        bidAmount: ZERO, askAmount: ZERO,
        srcMintAddress, dstMintAddress, poolData,
      }]);
    }
    // Curving
    const bidAmount = ssjs.inverseCurve(askAmount, bidReserve, askReserve, fee, FEE_DECIMALS);
    const slippage = ssjs.slippage(bidAmount, bidReserve, askReserve, fee, FEE_DECIMALS);
    const ratio = ssjs.div(askAmount, bidAmount);
    return resolve([{
      slippage, ratio, fee,
      bidAmount, askAmount,
      srcMintAddress, dstMintAddress, poolData,
    }]);
  });
}

Oracle._routingCurve = (bidAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData) => {
  return new Promise((resolve, reject) => {
    const { sol: { senAddress } } = configs;
    let data = [{}, {}];
    return Oracle._directCurve(bidAmount, srcMintAddress, senAddress, bidPoolData).then(([re]) => {
      data[0] = re;
      return Oracle._directCurve(re.askAmount, senAddress, dstMintAddress, askPoolData);
    }).then(([re]) => {
      data[1] = re;
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
  });
}

Oracle._inverseRoutingCurve = (askAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData) => {
  return new Promise((resolve, reject) => {
    const { sol: { senAddress } } = configs;
    let data = [{}, {}];
    return Oracle._inverseDirectCurve(askAmount, senAddress, dstMintAddress, askPoolData).then(([re]) => {
      data[0] = re;
      return Oracle._inverseDirectCurve(re.bidAmount, srcMintAddress, senAddress, bidPoolData);
    }).then(([re]) => {
      data[1] = re;
      return resolve(data);
    }).catch(er => {
      return reject(er);
    });
  });
}

export default Oracle;