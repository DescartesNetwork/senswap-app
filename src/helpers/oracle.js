import ssjs from 'senswapjs';
import configs from 'configs';

const ZERO = global.BigInt(0);
const FEE = global.BigInt(2500000);
const EARN = global.BigInt(500000);
const FEE_DECIMALS = global.BigInt(1000000000);

const Oracle = {}

Oracle.rake = async (deltaS, deltaA, deltaB, reserveS, reserveA, reserveB, reserveLPT) => {
  if (!deltaS && !deltaA && !deltaB) throw new Error('Invalid amounts');
  if (!reserveS || !reserveA || !reserveB) throw new Error('Outdated pool');
  const data = ssjs.rake(deltaS, deltaA, deltaB, reserveS, reserveA, reserveB, reserveLPT);
  return data;
}

Oracle.curve = async (bidAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData) => {
  if (typeof bidAmount !== 'bigint') throw new Error('Amount must be BigInt');
  if (!ssjs.isAddress(srcMintAddress)) throw new Error('Invalid source mint address');
  if (!bidPoolData) throw new Error('Invalid bid pool data');
  if (bidPoolData.state !== 1) throw new Error('Frozen bid pool');
  if (!ssjs.isAddress(dstMintAddress)) throw new Error('Invalid destination mint address');
  if (!askPoolData) throw new Error('Invalid ask pool data');
  if (askPoolData.state !== 1) throw new Error('Frozen ask pool');
  // Parse data
  const { address: bidPoolAddress } = bidPoolData;
  const { address: askPoolAddress } = askPoolData;
  // Shared pool
  if (bidPoolAddress === askPoolAddress)
    return await Oracle._directCurve(bidAmount, srcMintAddress, dstMintAddress, bidPoolData);
  // Routing - Shared SEN
  return await Oracle._routingCurve(bidAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData);
}

Oracle.inverseCurve = async (askAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData) => {
  if (typeof askAmount !== 'bigint') throw new Error('Amount must be BigInt');
  if (!ssjs.isAddress(srcMintAddress)) throw new Error('Invalid source mint address');
  if (!bidPoolData) throw new Error('Invalid bid pool data');
  if (bidPoolData.state !== 1) throw new Error('Frozen bid pool');
  if (!ssjs.isAddress(dstMintAddress)) throw new Error('Invalid destination mint address');
  if (!askPoolData) throw new Error('Invalid ask pool data');
  if (askPoolData.state !== 1) throw new Error('Frozen ask pool');
  // Parse data
  const { address: bidPoolAddress } = bidPoolData;
  const { address: askPoolAddress } = askPoolData;
  // Shared pool
  if (bidPoolAddress === askPoolAddress)
    return await Oracle._inverseDirectCurve(askAmount, srcMintAddress, dstMintAddress, askPoolData);
  // Routing - Shared SEN
  return await Oracle._inverseRoutingCurve(askAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData);
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

Oracle._directCurve = async (bidAmount, srcMintAddress, dstMintAddress, poolData) => {
  const bidReserve = Oracle._parseReserve(srcMintAddress, poolData);
  const askReserve = Oracle._parseReserve(dstMintAddress, poolData);

  if (!bidReserve || !askReserve) throw new Error('Outdated pool');

  // Fee
  const { sol: { senAddress } } = configs;
  const fee = dstMintAddress === senAddress ? FEE : FEE + EARN;

  // Default state
  if (!bidAmount) {
    const slippage = ZERO;
    const ratio = ssjs.div(askReserve, bidReserve);
    return [{
      slippage, ratio, fee,
      bidAmount: ZERO, askAmount: ZERO,
      srcMintAddress, dstMintAddress, poolData,
    }];
  }
  // Curving
  const askAmount = ssjs.curve(bidAmount, bidReserve, askReserve, fee, FEE_DECIMALS);
  const slippage = ssjs.slippage(bidAmount, bidReserve, askReserve, fee, FEE_DECIMALS);
  const ratio = ssjs.div(askAmount, bidAmount);
  return [{
    slippage, ratio, fee,
    bidAmount, askAmount,
    srcMintAddress, dstMintAddress, poolData,
  }];
}

Oracle._inverseDirectCurve = async (askAmount, srcMintAddress, dstMintAddress, poolData) => {
  const bidReserve = Oracle._parseReserve(srcMintAddress, poolData);
  const askReserve = Oracle._parseReserve(dstMintAddress, poolData);

  if (!bidReserve || !askReserve) throw new Error('Outdated pool');
  if (askAmount > askReserve) throw new Error('Cannot buy an amount larger than the available reserve');

  // Fee
  const { sol: { senAddress } } = configs;
  const fee = dstMintAddress === senAddress ? FEE : FEE + EARN;

  // Default state
  if (!askAmount) {
    const slippage = ZERO;
    const ratio = ssjs.div(askReserve, bidReserve);
    return [{
      slippage, ratio, fee,
      bidAmount: ZERO, askAmount: ZERO,
      srcMintAddress, dstMintAddress, poolData,
    }];
  }
  // Curving
  const bidAmount = ssjs.inverseCurve(askAmount, bidReserve, askReserve, fee, FEE_DECIMALS);
  const slippage = ssjs.slippage(bidAmount, bidReserve, askReserve, fee, FEE_DECIMALS);
  const ratio = ssjs.div(askAmount, bidAmount);
  return [{
    slippage, ratio, fee,
    bidAmount, askAmount,
    srcMintAddress, dstMintAddress, poolData,
  }];
}

Oracle._routingCurve = async (bidAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData) => {
  const { sol: { senAddress } } = configs;
  const [firstHop] = await Oracle._directCurve(bidAmount, srcMintAddress, senAddress, bidPoolData);
  const [secondHop] = await Oracle._directCurve(firstHop.askAmount, senAddress, dstMintAddress, askPoolData);
  return [firstHop, secondHop];
}

Oracle._inverseRoutingCurve = async (askAmount, srcMintAddress, bidPoolData, dstMintAddress, askPoolData) => {
  const { sol: { senAddress } } = configs;
  const [secondHop] = await Oracle._inverseDirectCurve(askAmount, senAddress, dstMintAddress, askPoolData);
  const [firstHop] = await Oracle._inverseDirectCurve(secondHop.bidAmount, srcMintAddress, senAddress, bidPoolData);
  return [firstHop, secondHop];
}

export default Oracle;