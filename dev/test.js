const Blockchain = require('./blockchain');


const bitcoin = new Blockchain();

const bc1 = {
"chain": [
{
"index": 1,
"nonce": 100,
"hash": "0",
"previousHash": "0",
"timestamp": 1535723996304,
"transactions": []
},
{
"index": 2,
"nonce": 16441,
"hash": "00009b2ef664890dbcd795344f8145bac1710db47cea457183f41c9ca24c3285",
"previousHash": "0",
"timestamp": 1535724001365,
"transactions": []
},
{
"index": 3,
"nonce": 42139,
"hash": "00003158e3a22185dcc9fdd295b71e51c6ecc3b1ea8a39f25dd2c39853900bf8",
"previousHash": "00009b2ef664890dbcd795344f8145bac1710db47cea457183f41c9ca24c3285",
"timestamp": 1535724015723,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"receiver": "243b7900ad2611e8809827613ce043b8",
"transactionid": "274620f0ad2611e8809827613ce043b8"
},
{
"amount": "180",
"sender": "23hdjs7238e",
"receiver": "sdfayt8742873412973",
"transactionid": "2c10c860ad2611e8809827613ce043b8"
}
]
}
],
"pendingTransactions": [
{
"amount": 12.5,
"sender": "00",
"receiver": "243b7900ad2611e8809827613ce043b8",
"transactionid": "2fcf2ff0ad2611e8809827613ce043b8"
}
],
"currentNodeUrl": "http://localhost:3001",
"networkNodes": []
}
console.log(bitcoin.isChainValid(bc1.chain))