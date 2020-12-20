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
  { key: 'sen', type: 'u64' },
  { key: 'fee_numerator', type: 'u64' },
  { key: 'fee_denominator', type: 'u64' },
  { key: 'initialized', type: 'bool' }
];
const SEN_SCHEMA = [
  { key: 'owner', type: 'pub' },
  { key: 'pool', type: 'pub' },
  { key: 'sen', type: 'u64' },
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
      return reject('Cannot read data');
    })
  });
}

SOL.getPoolData = (senAddress) => {
  return new Promise((resolve, reject) => {
    if (!senAddress) return reject('Invalid public key');
    const connection = SOL.createConnection();
    let result = { address: senAddress }
    return connection.getAccountInfo(SOL.fromAddress(senAddress)).then(({ data: senData }) => {
      if (!senData) return reject(`Cannot find data of ${result.address}`);
      const senLayout = new soproxABI.struct(SEN_SCHEMA);
      senLayout.fromBuffer(senData);
      let pool = { address: senLayout.value.pool };
      result = { ...result, ...senLayout.value, pool };
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
      return reject('Cannot read data');
    })
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
    const pool = new Account();
    const treasury = new Account();
    const sen = new Account();
    const poolSpace = (new soproxABI.struct(POOL_SCHEMA)).space;
    const treasurySpace = (new soproxABI.struct(ACCOUNT_SCHEMA)).space;
    const senSpace = (new soproxABI.struct(SEN_SCHEMA)).space;
    // Create accounts
    return connection.getMinimumBalanceForRentExemption(poolSpace).then(lamports => {
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
      return connection.getMinimumBalanceForRentExemption(senSpace);
    }).then(lamports => {
      const transaction = new Transaction();
      transaction.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: sen.publicKey,
        lamports,
        space: senSpace,
        programId: swapProgramId,
      }));
      return sendAndConfirmTransaction(
        connection, transaction, [payer, sen],
        { skipPreflight: true, commitment: 'recent' });
    }).then(re => {
      const seeds = [Buffer.from('escrowescrowescrowescrowescrowes', 'utf8'), pool.publicKey.toBuffer()];
      return PublicKey.createProgramAddress(seeds, swapProgramId);
    }).then(re => {
      const tokenOwnerPublicKey = re;
      const layout = new soproxABI.struct(
        [
          { key: 'code', type: 'u8' },
          { key: 'reserve', type: 'u64' },
          { key: 'sen', type: 'u64' },
        ],
        { code: 0, reserve, sen: stable }
      );
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: payer.publicKey, isSigner: true, isWritable: false },
          { pubkey: pool.publicKey, isSigner: true, isWritable: true },
          { pubkey: treasury.publicKey, isSigner: true, isWritable: true },
          { pubkey: sen.publicKey, isSigner: true, isWritable: true },
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
        connection, transaction, [payer, pool, treasury, sen],
        { skipPreflight: true, commitment: 'recent', });
    }).then(re => {
      return resolve({ pool, treasury, sen });
    }).catch(er => {
      console.log(er)
      return reject('Cannot create a pool or a treasury account');
    });
  });
}

SOL.addLiquidity = (reserve, poolPublicKey, treasuryPublicKey, senPublicKey, srcTokenPublickKey, tokenPublicKey, payer) => {
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
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: false },
        { pubkey: poolPublicKey, isSigner: false, isWritable: true },
        { pubkey: treasuryPublicKey, isSigner: false, isWritable: true },
        { pubkey: senPublicKey, isSigner: false, isWritable: true },
        { pubkey: srcTokenPublickKey, isSigner: false, isWritable: true },
        { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
        { pubkey: tokenProgramId, isSigner: false, isWritable: false },
      ],
      programId: swapProgramId,
      data: layout.toBuffer()
    });
    const transaction = new Transaction();
    transaction.add(instruction);
    return sendAndConfirmTransaction(
      connection, transaction, [payer],
      { skipPreflight: true, commitment: 'recent', }).then(re => {
        return resolve(re);
      }).catch(er => {
        return reject('Cannot add liquidity to the pool');
      });
  });
}

SOL.removeLiquidity = (sen, poolPublicKey, treasuryPublicKey, senPublickey, dstTokenPublickKey, tokenPublicKey, payer) => {
  return new Promise((resolve, reject) => {
    const connection = SOL.createConnection();
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;

    const tokenProgramId = SOL.fromAddress(tokenFactoryAddress);
    const swapProgramId = SOL.fromAddress(swapFactoryAddress);
    const layout = new soproxABI.struct(
      [
        { key: 'code', type: 'u8' },
        { key: 'sen', type: 'u64' },
      ],
      { code: 2, sen }
    );
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: false },
        { pubkey: poolPublicKey, isSigner: false, isWritable: true },
        { pubkey: treasuryPublicKey, isSigner: false, isWritable: true },
        { pubkey: senPublickey, isSigner: false, isWritable: true },
        { pubkey: dstTokenPublickKey, isSigner: false, isWritable: true },
        { pubkey: tokenPublicKey, isSigner: false, isWritable: false },
        { pubkey: tokenProgramId, isSigner: false, isWritable: false },
      ],
      programId: swapProgramId,
      data: layout.toBuffer()
    });
    const transaction = new Transaction();
    transaction.add(instruction);
    return sendAndConfirmTransaction(
      connection, transaction, [payer],
      { skipPreflight: true, commitment: 'recent', }).then(re => {
        return resolve(re);
      }).catch(er => {
        console.log(er)
        return reject('Cannot withdraw liquidity to the pool');
      });
  });
}

export default SOL;