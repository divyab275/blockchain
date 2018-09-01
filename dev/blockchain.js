const sha256 = require('sha256');
const currentNodeUrl = process.argv[3]
const uuid = require('uuid/v1')

function Blockchain(){
	this.chain = [];
	this.pendingTransactions = [];
	this.currentNodeUrl = currentNodeUrl,
	this.networkNodes = [],
	this.createNewBlock(100,'0','0')
}

Blockchain.prototype.createNewBlock = function(nonce,hash,previousHash){
	const newBlock = {
		index : this.chain.length + 1,
		nonce : nonce,
		hash : hash,
		previousHash : previousHash,
		timestamp : Date.now(),
		transactions : this.pendingTransactions
	};
	this.pendingTransactions = [];
	this.chain.push(newBlock);

	return newBlock;
}

Blockchain.prototype.getLastBlock = function(){
	return this.chain[this.chain.length - 1];
}

Blockchain.prototype.createNewTransaction = function(amount,sender,receiver){
	const transaction = {
		amount:amount,
		sender:sender,
		receiver:receiver,
		transactionid : uuid().split('-').join('')
	};

	return transaction
	
}

Blockchain.prototype.addNewTransactionToPending = function(newTransactionObj){

	this.pendingTransactions.push(newTransactionObj);
	return this.getLastBlock()['index']+1;
}

Blockchain.prototype.createHash = function(previousHash,nonce,blockdata){
	const dataAsString = previousHash + nonce + JSON.stringify(blockdata);
	//console.log(dataAsString)
	const hash = sha256(dataAsString);
	return hash;
}

Blockchain.prototype.proofOfWork = function(previousHash,blockdata){
	let nonce = 0
	let hash = this.createHash(previousHash,nonce,blockdata)
	while(hash.substring(0,4)!== '0000'){
		nonce++;
		hash = this.createHash(previousHash,nonce,blockdata)
	}
	//console.log(nonce);
	return nonce
}

Blockchain.prototype.isChainValid = function(blockchain){

	for(var i=1;i<blockchain.length;i++){
		const lastBlock = blockchain[i-1]
		const currentBlock = blockchain[i]
		if(lastBlock['hash'] !=currentBlock['previousHash'])
			return false;
		console.log('Correct previousHash')
		const hash = this.createHash(lastBlock['hash'],currentBlock['nonce'],{transaction: currentBlock['transactions'],index: currentBlock['index']})
		// console.log(lastBlock['hash'])
		// console.log(currentBlock['nonce'])
		// console.log({transaction: currentBlock['transactions'],index: currentBlock['index']})
		// console.log(hash)
		// const dataAsString = lastBlock['hash'] + currentBlock['nonce'] + JSON.stringify({transaction: currentBlock['transactions'],index: currentBlock['index']});
		// console.log(dataAsString)
		if(hash.substring(0,4)!= '0000')
			return false
		console.log('Correct Hash')
	

	}
	const geneysis = blockchain[0]
	const nonce = geneysis['nonce'] === 100
	const previousHash = geneysis['previousHash'] === '0'
	const currentHash = geneysis['hash'] === '0'
	const length = geneysis['transactions'].length === 0
	if(!nonce || !previousHash || !currentHash || !length)
		return false

	return true

}

Blockchain.prototype.getBlockUsingHash = function(blockhash){
	let correctBlock = null
	this.chain.forEach(block=>{
		if(block['hash'] == blockhash)
			correctBlock = block
	})
	return correctBlock
}

Blockchain.prototype.getTransaction = function(transactionid){
	let correctTransaction = null
	let correctBlock = null
	this.chain.forEach(block=>{
		block.transactions.forEach(transaction=>{
			if(transaction['transactionid'] == transactionid){
				correctTransaction = transaction
				correctBlock = block
			}
		})
	})

	return { transaction: correctTransaction,
			  block: correctBlock}
	
}

Blockchain.prototype.getAddressData = function(address){
	let transactions = []
	balance = 0
	this.chain.forEach(block=>{
		block.transactions.forEach(transaction=>{
			if(transaction['sender']==address || transaction['receiver'] == address)
				transactions.push(transaction)
		})
	})
	transactions.forEach(transaction=>{
		if(transaction['sender'] == address) balance-= transaction.amount
		else balance+=transaction.amount
	})
	return {
		addressTransactions:  transactions,
		addressBalance : balance
	}
}

module.exports = Blockchain;
