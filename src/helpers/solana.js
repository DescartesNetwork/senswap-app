const {PublicKey, Connection} = require('@solana/web3.js');

let connection = null;

export const getConnection = () => {
    if (connection === undefined || connection == null) {
        return new Connection('https://devnet.solana.com/')
    }
    return connection
}

export const getTokenAccountsByOwner = async (ownerAddress, programId) => {
    const _ownerAddress = new PublicKey(ownerAddress)
    const _programId = new PublicKey(programId)
    const conn = getConnection()
    const data = await conn.getTokenAccountsByOwner(_ownerAddress, {programId: _programId})

    let tokens = []
    for (const d of data.value) {
        tokens.push(d.pubkey.toString())
    }
    return tokens
}