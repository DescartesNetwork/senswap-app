import {
  Account, Connection, PublicKey, Transaction,
  LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction,
  TransactionInstruction,
} from '@solana/web3.js';
import soproxABI from 'soprox-abi';

import configs from 'configs';

/**
 * Main
 */
const SOL = {}

/**
 * Constants
 */
const ACCOUNT_SCHEMA = [
  { key: 'owner', type: 'pub' },
  { key: 'token', type: 'pub' },
  { key: 'amount', type: 'u64' },
  { key: 'initialized', type: 'bool' }
];
const TOKEN_SCHEMA = [
  { key: 'symbol', type: '[char;4]' },
  { key: 'total_supply', type: 'u64' },
  { key: 'decimals', type: 'u8' },
  { key: 'initialized', type: 'bool' }
];
const POOL_SCHEMA = [
  { key: 'token', type: 'pub' },
  { key: 'treasury', type: 'pub' },
  { key: 'reserve', type: 'u64' },
  { key: 'lpt', type: 'u64' },
  { key: 'fee_numerator', type: 'u64' },
  { key: 'fee_denominator', type: 'u64' },
  { key: 'initialized', type: 'bool' }
];
const LPT_SCHEMA = [
  { key: 'owner', type: 'pub' },
  { key: 'pool', type: 'pub' },
  { key: 'lpt', type: 'u64' },
  { key: 'initialized', type: 'bool' }
];

SOL.isAddress = (address) => {
  try {
    const publicKey = new PublicKey(address);
    if (!publicKey) throw new Error('Invalid public key');
    return true;
  } catch (er) {
    return false;
  }
}

SOL.safelyCreateAccount = (programId) => {
  return new Promise((resolve, reject) => {
    const account = new Account();
    const seeds = [account.publicKey.toBuffer()];
    return PublicKey.createProgramAddress(seeds, programId).then(re => {
      return resolve(account);
    }).catch(er => {
      return SOL.safelyCreateAccount(programId);
    });
  });
}

SOL.toSymbol = (symbol) => {
  if (!symbol) return '';
  return symbol.join('').replace(/\u0000/g, '').replace(/-/g, '');
}

SOL.fromSecretKey = (secretKey) => {
  const account = new Account(Buffer.from(secretKey, 'hex'));
  return account;
}

SOL.fromAddress = (address) => {
  const publicKey = new PublicKey(address);
  return publicKey;
}

SOL.createConnection = () => {
  const { sol: { node } } = configs;
  const connection = new Connection(node, 'recent');
  return connection;
}

SOL.getBalance = (address) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const publicKey = SOL.fromAddress(address);
    return connection.getBalance(publicKey).then(re => {
      return resolve(re / LAMPORTS_PER_SOL);
    }).catch(er => {
      return reject(er);
    });
  })
}

SOL.getPureTokenData = (tokenAddress) => {
  return new Promise((resolve, reject) => {
    if (!tokenAddress) return reject('Invalid address');
    const connection = SOL.createConnection();
    return connection.getAccountInfo(SOL.fromAddress(tokenAddress)).then(({ data }) => {
      if (!data) return reject(`Cannot find data of ${tokenAddress}`);
      const tokenLayout = new soproxABI.struct(TOKEN_SCHEMA);
      tokenLayout.fromBuffer(data);
      const result = { address: tokenAddress, ...tokenLayout.value };
      return resolve(result);
    }).catch(er => {
      console.error(er);
      return reject('Cannot read data');
    });
  });
}

SOL.getTokenData = (accountAddress) => {
  return new Promise((resolve, reject) => {
    if (!accountAddress) return reject('Invalid public key');
    const connection = SOL.createConnection();
    let result = { address: accountAddress }
    return connection.getAccountInfo(SOL.fromAddress(accountAddress)).then(({ data: accountData }) => {
      if (!accountData) return reject(`Cannot find data of ${result.address}`);
      const accountLayout = new soproxABI.struct(ACCOUNT_SCHEMA);
      accountLayout.fromBuffer(accountData);
      let token = { address: accountLayout.value.token };
      result = { ...result, ...accountLayout.value, token };
      return connection.getAccountInfo(SOL.fromAddress(result.token.address));
    }).then(({ data: tokenData }) => {
      if (!tokenData) return reject(`Cannot find data of ${result.token.address}`);
      const tokenLayout = new soproxABI.struct(TOKEN_SCHEMA);
      tokenLayout.fromBuffer(tokenData);
      result.token = { ...result.token, ...tokenLayout.value };
      return resolve(result);
    }).catch(er => {
      console.error(er);
      return reject('Cannot read data');
    });
  });
}

SOL.getPurePoolData = (poolAddress) => {
  return new Promise((resolve, reject) => {
    if (!poolAddress) return reject('Invalid public key');
    const connection = SOL.createConnection();
    let result = { address: poolAddress }
    return connection.getAccountInfo(SOL.fromAddress(poolAddress)).then(({ data: poolData }) => {
      if (!poolData) return reject(`Cannot find data of ${result.address}`);
      const poolLayout = new soproxABI.struct(POOL_SCHEMA);
      poolLayout.fromBuffer(poolData);
      let treasury = { address: poolLayout.value.treasury };
      let token = { address: poolLayout.value.token };
      result = { ...result, ...poolLayout.value, treasury, token };
      return connection.getAccountInfo(SOL.fromAddress(result.token.address));
    }).then(({ data: tokenData }) => {
      if (!tokenData) return reject(`Cannot find data of ${result.token.address}`);
      const tokenLayout = new soproxABI.struct(TOKEN_SCHEMA);
      tokenLayout.fromBuffer(tokenData);
      result.token = { ...result.token, ...tokenLayout.value };
      return connection.getAccountInfo(SOL.fromAddress(result.treasury.address));
    }).then(({ data: treasuryData }) => {
      if (!treasuryData) return reject(`Cannot find data of ${result.treasury.address}`);
      const treasuryLayout = new soproxABI.struct(ACCOUNT_SCHEMA);
      treasuryLayout.fromBuffer(treasuryData);
      result.treasury = { ...result.treasury, ...treasuryLayout.value };
      return resolve(result);
    }).catch(er => {
      console.error(er);
      return reject('Cannot read data');
    });
  });
}

SOL.getPoolData = (lptAddress) => {
  return new Promise((resolve, reject) => {
    if (!lptAddress) return reject('Invalid public key');
    const connection = SOL.createConnection();
    let result = { address: lptAddress }
    return connection.getAccountInfo(SOL.fromAddress(lptAddress)).then(({ data: lptData }) => {
      if (!lptData) return reject(`Cannot find data of ${result.address}`);
      const lptLayout = new soproxABI.struct(LPT_SCHEMA);
      lptLayout.fromBuffer(lptData);
      let pool = { address: lptLayout.value.pool };
      result = { ...result, ...lptLayout.value, pool };
      return connection.getAccountInfo(SOL.fromAddress(result.pool.address));
    }).then(({ data: poolData }) => {
      if (!poolData) return reject(`Cannot find data of ${result.pool.address}`);
      const poolLayout = new soproxABI.struct(POOL_SCHEMA);
      poolLayout.fromBuffer(poolData);
      let treasury = { address: poolLayout.value.treasury };
      let token = { address: poolLayout.value.token };
      result.pool = { ...result.pool, ...poolLayout.value, treasury, token };
      return connection.getAccountInfo(SOL.fromAddress(result.pool.token.address));
    }).then(({ data: tokenData }) => {
      if (!tokenData) return reject(`Cannot find data of ${result.pool.token.address}`);
      const tokenLayout = new soproxABI.struct(TOKEN_SCHEMA);
      tokenLayout.fromBuffer(tokenData);
      result.pool.token = { ...result.pool.token, ...tokenLayout.value };
      return connection.getAccountInfo(SOL.fromAddress(result.pool.treasury.address));
    }).then(({ data: treasuryData }) => {
      if (!treasuryData) return reject(`Cannot find data of ${result.pool.treasury.address}`);
      const treasuryLayout = new soproxABI.struct(ACCOUNT_SCHEMA);
      treasuryLayout.fromBuffer(treasuryData);
      result.pool.treasury = { ...result.pool.treasury, ...treasuryLayout.value };
      return resolve(result);
    }).catch(er => {
      console.error(er);
      return reject('Cannot read data');
    })
  });
}

SOL.newToken = (symbol, totalSupply, decimals, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress } } = configs;
    const programId = SOL.fromAddress(tokenFactoryAddress);
    const receiver = new Account();
    const token = new Account();
    const receiverSpace = (new soproxABI.struct(ACCOUNT_SCHEMA)).space;
    const tokenSpace = (new soproxABI.struct(TOKEN_SCHEMA)).space;
    return connection.getMinimumBalanceForRentExemption(receiverSpace).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: receiver.publicKey,
        lamports,
        space: receiverSpace,
        programId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, receiver],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      return connection.getMinimumBalanceForRentExemption(tokenSpace);
    }).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: token.publicKey,
        lamports,
        space: tokenSpace,
        programId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, token],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      const layout = new soproxABI.struct(
        [
          { key: 'code', type: 'u8' },
          { key: 'symbol', type: '[char;4]' },
          { key: 'totalSupply', type: 'u64' },
          { key: 'decimals', type: 'u8' },
        ],
        { code: 0, symbol, totalSupply, decimals });
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: token.publicKey, isSigner: true, isWritable: true },
          { pubkey: receiver.publicKey, isSigner: true, isWritable: true },
        ],
        programId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection,
        transaction,
        [payer, token, receiver],
        { skipPreflight: true, commitment: 'recent', });
    }).then(txId => {
      return resolve({ token, receiver, txId });
    }).catch(er => {
      console.error(er);
      return reject('Cannot deploy a new token');
    });
  });
}

SOL.newSRC20Account = (tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress } } = configs;
    const programId = SOL.fromAddress(tokenFactoryAddress);
    const account = new Account();
    const space = (new soproxABI.struct(ACCOUNT_SCHEMA)).space;
    return connection.getMinimumBalanceForRentExemption(space).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: account.publicKey,
        lamports,
        space,
        programId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, account],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      const layout = new soproxABI.struct(
        [{ key: 'code', type: 'u8' }],
        { code: 1, }
      );
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: account.publicKey, isSigner: true, isWritable: true },
        ],
        programId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer, account],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve(account);
    }).catch(er => {
      console.error(er);
      return reject('Cannot create a SRC20 account');
    });
  });
}

SOL.newPool = (reserve, stable, srcTokenPublickKey, tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = SOL.fromAddress(tokenFactoryAddress);
    const swapProgramId = SOL.fromAddress(swapFactoryAddress);
    let pool = null;
    let treasury = new Account();
    let lpt = new Account();
    const poolSpace = (new soproxABI.struct(POOL_SCHEMA)).space;
    const treasurySpace = (new soproxABI.struct(ACCOUNT_SCHEMA)).space;
    const lptSpace = (new soproxABI.struct(LPT_SCHEMA)).space;
    return SOL.safelyCreateAccount(swapProgramId).then(re => {
      pool = re;
      // Create accounts
      return connection.getMinimumBalanceForRentExemption(poolSpace)
    }).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: pool.publicKey,
        lamports,
        space: poolSpace,
        programId: swapProgramId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, pool],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      return connection.getMinimumBalanceForRentExemption(treasurySpace);
    }).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: treasury.publicKey,
        lamports,
        space: treasurySpace,
        programId: tokenProgramId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, treasury],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      return connection.getMinimumBalanceForRentExemption(lptSpace);
    }).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: lpt.publicKey,
        lamports,
        space: lptSpace,
        programId: swapProgramId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, lpt],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      const seed = [pool.publicKey.toBuffer()];
      return PublicKey.createProgramAddress(seed, swapProgramId);
    }).then(tokenOwnerPublicKey => {
      const layout = new soproxABI.struct(
        [
          { key: 'code', type: 'u8' },
          { key: 'reserve', type: 'u64' },
          { key: 'lpt', type: 'u64' },
        ],
        { code: 0, reserve, lpt: stable }
      );
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: pool.publicKey, isSigner: true, isWritable: true },
          { pubkey: treasury.publicKey, isSigner: true, isWritable: true },
          { pubkey: lpt.publicKey, isSigner: true, isWritable: true },
          { pubkey: srcTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenOwnerPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        ],
        programId: swapProgramId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer, pool, treasury, lpt],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve({ pool, treasury, lpt });
    }).catch(er => {
      console.log(er);
      return reject('Cannot create a pool or a treasury account');
    });
  });
}

SOL.addLiquidity = (reserve, poolPublicKey, treasuryPublicKey, lptPublicKey, srcTokenPublickKey, tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = SOL.fromAddress(tokenFactoryAddress);
    const swapProgramId = SOL.fromAddress(swapFactoryAddress);
    const layout = new soproxABI.struct(
      [
        { key: 'code', type: 'u8' },
        { key: 'reserve', type: 'u64' },
      ],
      { code: 1, reserve }
    );
    const seed = [poolPublicKey.toBuffer()];
    return PublicKey.createProgramAddress(seed, swapProgramId).then(tokenOwnerPublicKey => {
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: poolPublicKey, isSigner: false, isWritable: true },
          { pubkey: treasuryPublicKey, isSigner: false, isWritable: true },
          { pubkey: lptPublicKey, isSigner: false, isWritable: true },
          { pubkey: srcTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenOwnerPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        ],
        programId: swapProgramId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve(re);
    }).catch(er => {
      console.log(er);
      return reject('Cannot add liquidity to the pool');
    });;
  });
}

SOL.removeLiquidity = (lpt, poolPublicKey, treasuryPublicKey, lptPublickey, dstTokenPublickKey, tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = SOL.fromAddress(tokenFactoryAddress);
    const swapProgramId = SOL.fromAddress(swapFactoryAddress);
    const layout = new soproxABI.struct(
      [
        { key: 'code', type: 'u8' },
        { key: 'lpt', type: 'u64' },
      ],
      { code: 2, lpt }
    );
    const seed = [poolPublicKey.toBuffer()];
    return PublicKey.createProgramAddress(seed, swapProgramId).then(tokenOwnerPublicKey => {
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: poolPublicKey, isSigner: false, isWritable: true },
          { pubkey: treasuryPublicKey, isSigner: false, isWritable: true },
          { pubkey: lptPublickey, isSigner: false, isWritable: true },
          { pubkey: dstTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenOwnerPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        ],
        programId: swapProgramId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve(re);
    }).catch(er => {
      console.log(er);
      return reject('Cannot withdraw liquidity to the pool');
    })
  });
}

SOL.swap = (
  amount,
  payer,
  bidPoolPublicKey,
  bidTreasuryPublicKey,
  srcTokenPublickKey,
  bidTokenPublickKey,
  askPoolPublicKey,
  askTreasuryPublickKey,
  dstTokenPublickKey,
  askTokenPublicKey,
) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = SOL.fromAddress(tokenFactoryAddress);
    const swapProgramId = SOL.fromAddress(swapFactoryAddress);
    const layout = new soproxABI.struct(
      [
        { key: 'code', type: 'u8' },
        { key: 'amount', type: 'u64' },
      ],
      { code: 3, amount }
    );
    const seed = [askPoolPublicKey.toBuffer()];
    return PublicKey.createProgramAddress(seed, swapProgramId).then(askTokenOwnerPublicKey => {
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: bidPoolPublicKey, isSigner: false, isWritable: true },
          { pubkey: bidTreasuryPublicKey, isSigner: false, isWritable: true },
          { pubkey: srcTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: bidTokenPublickKey, isSigner: false, isWritable: false },
          { pubkey: askPoolPublicKey, isSigner: false, isWritable: true },
          { pubkey: askTreasuryPublickKey, isSigner: false, isWritable: true },
          { pubkey: dstTokenPublickKey, isSigner: false, isWritable: true },
          { pubkey: askTokenPublicKey, isSigner: false, isWritable: false },
          { pubkey: askTokenOwnerPublicKey, isSigner: false, isWritable: false },
          { pubkey: tokenProgramId, isSigner: false, isWritable: false },
        ],
        programId: swapProgramId,
        data: layout.toBuffer()
      });
      const transaction = new Transaction();
      transaction.add(instruction);
      return sendAndConfirmTransaction(
        connection, transaction, [payer],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve(re);
    }).catch(er => {
      console.log(er);
      return reject('Cannot swap');
    })
  });
}

SOL.transfer = (amount, tokenPublicKey, srcPublicKey, dstPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress } } = configs;
    const programId = SOL.fromAddress(tokenFactoryAddress);

    const layout = new soproxABI.struct(
      [
        { key: 'code', type: 'u8' },
        { key: 'amount', type: 'u64' }
      ],
      { code: 3, amount });
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: false },
        { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
        { pubkey: srcPublicKey, isSigner: false, isWritable: true },
        { pubkey: dstPublicKey, isSigner: false, isWritable: true },
      ],
      programId,
      data: layout.toBuffer()
    });
    const transaction = new Transaction();
    transaction.add(instruction);
    return sendAndConfirmTransaction(
      connection, transaction, [payer],
      {
        skipPreflight: true,
        commitment: 'recent'
      }).then(txId => {
        return resolve(txId);
      }).catch(er => {
        console.error(er);
        return reject('Cannot transfer token');
      });
  });
}

export default SOL;