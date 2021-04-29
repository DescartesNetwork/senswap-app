const {PublicKey, Connection} = require('@solana/web3.js');

let connection = null;

export const getConnection = () => {
    if (connection == undefined || connection == null) {
        return new Connection('https://devnet.solana.com/')
    }
    return connection
}

export const getTokenAccountsByOwner = async (ownerAddress, programId) => {
    const _ownerAddress = new PublicKey("GHjB1mY6WinFHy6kz81boVBmGoaM5PN37r75TLJfcU3c")
    //const _ownerAddress = new PublicKey(ownerAddress)
    const _programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    //const _programId = new PublicKey(programId)
    const conn = getConnection()
    const data = await conn.getTokenAccountsByOwner(_ownerAddress, {programId: _programId})
    console.log("Data => ", data)
    return data
}