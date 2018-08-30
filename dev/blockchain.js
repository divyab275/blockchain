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
		receiver:receiver
	};
	this.pendingTransactions.push(transaction);
	return this.getLastBlock()['index']+1;
}

Blockchain.prototype.createHash = function(previousHash,nonce,blockdata){
	const dataAsString = previousHash + nonce + JSON.stringify(blockdata);
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
	console.log(nonce);
	return nonce
}


module.exports = Blockchain;
