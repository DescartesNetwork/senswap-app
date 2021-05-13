import * as sb_abi from 'soprox-abi'
import * as ssjs from 'senswapjs'
import {Connection, ConfirmedTransaction, PublicKey} from "@solana/web3.js";
import configs from "../configs";
import * as schema from "senswapjs";

let connection = null

export const getConnection = () => {
    if (connection === undefined || connection == null) {
        return new Connection('https://devnet.solana.com/')
    }
    return connection
}

const actionType = {
    _3_SWAP: 3,
}

/**
 *
 * @param timeFrom
 * @param timeTo
 * @returns {Promise<void>}
 */
export const findAllTransactionByTime = async (address, timeFrom, timeTo) => {
    try {
        const addr = ssjs.account.fromAddress(address)

        const signatures = []
        let isContinue = true
        let signature = ""
        while (isContinue) {
            let options = {limit: 50}
            if (signature !== "") {
                options = {limit: 50, before: signature}
            }
            const transactions = await getConnection().getConfirmedSignaturesForAddress2(addr, options)
            for (const tx of transactions) {
                const blockTime = tx.blockTime * 1000
                if (blockTime > timeTo) continue
                if (blockTime < timeFrom) {
                    isContinue = false
                    break
                }
                signature = tx.signature
                signatures.push(signature)
            }
        }

        const result = []
        const signaturesss = ["51LGRz6yMio61NdoyZ45Z92tbZFFF48WWVTbhLzm7HbGLjHqdn91PuQVdtfr6fDW5p7Vxkcw2gRhS1sJt8AsD8mv"]
        for (const s of signaturesss) {
            const /*ConfirmedTransaction*/ confirmedTx = await getConnection().getConfirmedTransaction(s)
            if (confirmedTx == null) continue

            const accounts = []
            confirmedTx.transaction.compileMessage().accountKeys.map(key => {
                accounts.push(key.toString())
            })
            if (accounts[accounts.length] !== "programId") continue

            const layout = new sb_abi.struct([
                {key: 'code', type: 'u8'},
                {key: 'amount', type: 'u64'}
            ]);
            layout.fromBuffer(confirmedTx.transaction.data);
            const {code, amount} = layout.value
            // console.log("code", code)

            const postTokenBalances = confirmedTx.meta.postTokenBalances
            const preTokenBalances = confirmedTx.meta.preTokenBalances
            const data = parseInstruction(accounts, code, preTokenBalances, postTokenBalances)
            result.push(data)
        }
        console.log("result", result)
    } catch (error) {
        throw new Error(error.message)
    }
}

export const parseInstruction = (accounts, code,/*TokenBalance[]*/preTokenBalances,/*TokenBalance[]*/postTokenBalances) => {
    try {
        const data = []
        let source
        let dest
        let amount
        switch (code) {
            case actionType._3_SWAP:
                source = accounts[3]
                dest = accounts[5]
                for (let i = 0; i < postTokenBalances.length; i++) {
                    const post = postTokenBalances[i]
                    const pre = preTokenBalances[i]

                    const acc = accounts[post.accountIndex]
                    if (acc === source) {
                        amount = pre.uiTokenAmount.uiAmount - post.uiTokenAmount.uiAmount
                        data.push({
                            sourceAccount: accounts[post.accountIndex],
                            mint: post.mint,
                            tokenAmount: amount
                        })
                    }
                    if (acc === dest) {
                        amount = post.uiTokenAmount.uiAmount - pre.uiTokenAmount.uiAmount
                        data.push({
                            destAccount: accounts[post.accountIndex],
                            mint: post.mint,
                            tokenAmount: amount
                        })
                    }
                }
            default:
        }
        return data
    } catch (error) {
        throw new Error(error.message)
    }
}