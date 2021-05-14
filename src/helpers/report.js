import sb_abi from 'soprox-abi'
import ssjs from 'senswapjs'
import { Connection } from "@solana/web3.js";
import configs from 'configs';


let connection = null

export const getConnection = () => {
  if (connection === undefined || connection == null) {
    return new Connection(configs.sol.node)
  }
  return connection
}

const actionCode = {
  _1_DEPOSIT: 1,
  _2_WITHDRAW: 2,
  _3_SWAP_OR_TRANSFER: 3,
}

const actionType = {
  _1_DEPOSIT: "deposit",
  _2_WITHDRAW: "withdraw",
  _3_SWAP: "swap",
  _3_TRANSFER: "transfer"
}

/**
 *
 * @param address
 * @param timeFrom <format seconds>
 * @param timeTo <format seconds>
 * @returns {Promise<[]>}
 */
export const findAllTransactionByTime = async (address, timeFrom, timeTo) => {
  try {
    const addr = ssjs.account.fromAddress(address)

    const signatures = []
    let isContinue = true
    let signature = ""
    while (isContinue) {
      let options = { limit: 50 }
      if (signature !== "") {
        options = { limit: 50, before: signature }
      }
      const transactions = await getConnection().getConfirmedSignaturesForAddress2(addr, options)
      for (const tx of transactions) {
        const blockTime = tx.blockTime
        if (blockTime > timeTo) continue
        if (blockTime < timeFrom) {
          isContinue = false
          break
        }
        signature = tx.signature
        signatures.push({ signature, blockTime })
      }
    }

    const result = []
    for (const s of signatures) {
      const blockTime = s.blockTime
      const signature = s.signature
      const /*ConfirmedTransaction*/ confirmedTx = await getConnection().getConfirmedTransaction(signature)
      if (confirmedTx == null) continue

      const accounts = []
      confirmedTx.transaction.compileMessage().accountKeys.map(key => {
        accounts.push(key.toString())
      })
      if (accounts.length <= 0) continue

      const programIds = confirmedTx.transaction.instructions.map(r => {
        return r.programId.toString()
      })
      const programId = programIds[0]
      // console.log("programId", programId)
      if (programId !== configs.sol.spltAddress && programId !== configs.sol.swapAddress) continue

      const layout = new sb_abi.struct([
        { key: 'code', type: 'u8' },
        { key: 'amount', type: 'u64' }
      ]);
      layout.fromBuffer(confirmedTx.transaction.data);
      const { code } = layout.value
      // console.log("code", code)

      const postTokenBalances = confirmedTx.meta.postTokenBalances
      // console.log("postTokenBalances", postTokenBalances)
      const preTokenBalances = confirmedTx.meta.preTokenBalances
      // console.log("preTokenBalances", preTokenBalances)

      let type
      switch (code) {
        case 1:
          type = actionType._1_DEPOSIT
          break
        case 2:
          type = actionType._2_WITHDRAW
          break
        case 3:
          type = actionType._3_SWAP
          break
        default:
          break
      }

      let data
      if (programId === configs.sol.swapAddress) {
        data = parseInstruction(accounts, code, preTokenBalances, postTokenBalances)
        result.push({ ...data, blockTime, type, signature })
        continue
      }
      if (code === 3) {
        type = actionType._3_TRANSFER
      }
      data = parseInstructionSplt(accounts, code, preTokenBalances, postTokenBalances)
      result.push({ ...data, blockTime, type, signature })
    }
    // console.log("result", result)
    return result
  } catch (error) {
    throw new Error(error.message)
  }
}

export const parseInstruction = (accounts, code,/*TokenBalance[]*/preTokenBalances,/*TokenBalance[]*/postTokenBalances) => {
  try {
    const data = []
    let amount

    switch (code) {
      case actionCode._3_SWAP_OR_TRANSFER:
        let source = accounts[3]
        let dest = accounts[5]
        for (let i = 0; i < postTokenBalances.length; i++) {
          let post = postTokenBalances[i]
          let pre = preTokenBalances[i]

          const acc = accounts[post.accountIndex]
          if (acc === source) {
            amount = global.BigInt(pre.uiTokenAmount.amount) - global.BigInt(post.uiTokenAmount.amount)
            data.push({
              sourceAccount: accounts[post.accountIndex],
              mint: pre.mint,
              amount: amount,
            })
          }
          if (acc === dest) {
            amount = global.BigInt(post.uiTokenAmount.amount) - global.BigInt(pre.uiTokenAmount.amount)
            data.push({
              destAccount: accounts[post.accountIndex],
              mint: post.mint,
              amount: amount,
            })
          }
        }
        break
      case actionCode._2_WITHDRAW:
        let post = postTokenBalances[0]
        let pre = preTokenBalances[0]
        data.push({
          account: accounts[post.accountIndex],
          mint: post.mint,
          amount: global.BigInt(pre.uiTokenAmount.amount) - global.BigInt(post.uiTokenAmount.amount),
        })
        break
      case actionCode._1_DEPOSIT:
        let postDeposit = postTokenBalances[4]
        let preDeposit = preTokenBalances[4]
        data.push({
          account: accounts[postDeposit.accountIndex],
          mint: postDeposit.mint,
          amount: global.BigInt(postDeposit.uiTokenAmount.amount) - global.BigInt(preDeposit.uiTokenAmount.amount)
        })
        break
      default:
        console.log("code", code)
        break
    }
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}

export const parseInstructionSplt = (accounts, code,/*TokenBalance[]*/preTokenBalances,/*TokenBalance[]*/postTokenBalances) => {
  try {
    const data = []
    let source
    let dest
    let amount
    switch (code) {
      case actionCode._3_SWAP_OR_TRANSFER:
        source = accounts[1]
        dest = accounts[2]
        const post = postTokenBalances[0]
        const pre = preTokenBalances[0]
        amount = global.BigInt(pre.uiTokenAmount.amount) - global.BigInt(post.uiTokenAmount.amount)

        data.push({
          sourceAccount: source,
          mint: post.mint,
          amount: amount,
        }, {
          destAccount: dest,
          mint: post.mint,
          amount: amount,
        })
        break
      default:
        console.log("code", code)
        break
    }
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}