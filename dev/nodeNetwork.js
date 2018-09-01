const express = require('express');
const BlockChain = require('./blockchain');
const bodyParser = require('body-parser');
const app = express();
const uuid = require('uuid/v1');
const bitcoin = new BlockChain();
const nodeAddress = uuid().split('-').join('');
const port = process.argv[2];
const rp = require('request-promise');
var Promise = require('es6-promise').Promise;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
 
app.get('/blockchain', function (req, res) {
  res.send(bitcoin);
});

app.post('/transaction', function (req, res) {
 
	const index = bitcoin.addNewTransactionToPending(req.body)
	res.json({'note':`The transaction will be added to ${index}  block.`});

});

app.post('/transaction/broadcast',function(req,res){

	const newTransaction = bitcoin.createNewTransaction(req.body.amount,req.body.sender,req.body.receiver);
	bitcoin.addNewTransactionToPending(newTransaction)

	const requestPromises=[]
	bitcoin.networkNodes.forEach(networkNodeUrl=>{

		
		const requestOptions ={
			uri: networkNodeUrl+'/transaction',
			method : 'POST',
			body : newTransaction,
			json : true
		}
		requestPromises.push(rp(requestOptions)) 
	})

	Promise.all(requestPromises)
	.then(data=>{

		res.json({note:'Successfull transaction broadcasting'})
	})
})

app.get('/mine', function (req, res) {
	const lastBlock = bitcoin.getLastBlock();
	const previousHash = lastBlock['hash'];
	const currBlockData = {
		transaction : bitcoin.pendingTransactions,
		index : lastBlock['index']+1
	}
	const nonce = bitcoin.proofOfWork(previousHash,currBlockData);
	const currentHash = bitcoin.createHash(previousHash,nonce,currBlockData);
	
  	const newBlock = bitcoin.createNewBlock(nonce,currentHash,previousHash)

  	const minePromises=[]
  	bitcoin.networkNodes.forEach(networkNodeUrl=>{
  		const miningOptions = {
  			uri : networkNodeUrl+'/receive-new',
  			method : 'POST',
  			body : {'newBlock':newBlock},
  			json : true
  		}
  		minePromises.push(rp(miningOptions))

  	})

  	Promise.all(minePromises)
  	.then(data=>{
  		const requestOptions = {
  			uri : bitcoin.currentNodeUrl + '/transaction/broadcast',
  			method : 'POST',
  			body : {
  				amount : 12.5,
  				sender : '00',
  				receiver : nodeAddress	
  			},
  			json : true
  		}
  		return rp(requestOptions)
  	})
  	.then(data=>{
  			res.json({note:"New block mined successfully",
  			  block:newBlock,
  			  currBlockData:currBlockData	})
  	})
   
})

app.post('/receive-new',function(req,res){

	lastBlock = bitcoin.getLastBlock()
	const newBlock = req.body.newBlock
	const correctHash = newBlock['previousHash'] === lastBlock['hash']
	const correctIndex  = newBlock['index'] === lastBlock['index'] + 1
	if(correctIndex && correctHash){
		bitcoin.chain.push(newBlock);
		bitcoin.pendingTransactions = []
		res.json({note:'new block added successfully',
				  block: newBlock})
	}else{
		res.json({note:'new block rejected successfully',
				  block: newBlock})
	}
	
})


app.post('/register-and-broadcast-node',function(req,res){
	const newNodeUrl = req.body.newNodeUrl;
	

	if(bitcoin.networkNodes.indexOf(newNodeUrl)==-1)
		bitcoin.networkNodes.push(newNodeUrl);
	const registerNodePromises=[];
	bitcoin.networkNodes.forEach(networkNodeUrl=>{
		const requestOptions={
			uri: networkNodeUrl+'/register-node',
			method: 'POST',
			body: {newNodeUrl:newNodeUrl},
			json:true
		};
		registerNodePromises.push(rp(requestOptions));

	});

	Promise.all(registerNodePromises)
	.then(data=>{

			const bulkRegisterOptions = {
				uri : newNodeUrl + '/register-bulk-nodes',
				method : 'POST',
				body : { allNetworkNodes : [...bitcoin.networkNodes,bitcoin.currentNodeUrl]},
				json : true
			};
			return rp(bulkRegisterOptions);

		})
		  .catch(err => {
		    console.error(err);
		    return err; 
		  })
	.then(data=>{

		res.json({note : 'Node registered in the network'});

	})
	.catch(err => {
		    console.error(err);
		    return err; 
		  })
	
});

app.post('/register-node',function(req,res){

	const newNodeUrl = req.body.newNodeUrl;
	const notCurrentNode = bitcoin.currentNodeUrl!=newNodeUrl;
	const notAlreadyPresentNode = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
	if(notCurrentNode&&notAlreadyPresentNode)
		bitcoin.networkNodes.push(newNodeUrl);
	res.json({note:"Successfully registered node"});

});

app.post('/register-bulk-nodes',function(req,res){

	const allNetworkNodes = req.body.allNetworkNodes;

	allNetworkNodes.forEach(networkNodeUrl=>{
		const notCurrentNode = bitcoin.currentNodeUrl!=networkNodeUrl
		const notAlreadyPresentNode = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1
		if(notCurrentNode&&notAlreadyPresentNode)
			bitcoin.networkNodes.push(networkNodeUrl)
	})
	res.json({note:"Bulk registration successfull"})
})

app.listen(port,function(){
	console.log(`Listening on port ${port}`)
})


app.get('/consensus',function(req,res){
	requestPromises  = []
	bitcoin.networkNodes.forEach(networkNodeUrl=>{
		const requestOptions = {
			uri : networkNodeUrl + '/blockchain',
			method : 'GET',
			json : true
		}
		requestPromises.push(rp(requestOptions))

	})

	Promise.all(requestPromises)
	.then(blockchains=>{
		let maxChainLength = bitcoin.chain.length
		let newPendingTransactions = null
		let newLongestChain = null

		blockchains.forEach(blockchain=>{
			if(blockchain.chain.length>maxChainLength){
				maxChainLength = blockchain.chain.length
				newLongestChain = blockchain.chain
				newPendingTransactions = blockchain.pendingTransactions
			}
		})

		if((!newLongestChain) || (newLongestChain && !bitcoin.isChainValid(newLongestChain))){
			res.json({
				note : "Chain not changed",
				chain : bitcoin.chain
			})
		}
		else{
			bitcoin.chain = newLongestChain
			bitcoin.pendingTransactions = newPendingTransactions
			res.json({
				note : "Chain changed",
				chain : newLongestChain
			})
		}
	})
})

app.get('/block/:blockhash',function(req,res){
	const blockHash = req.params.blockhash
	const block = bitcoin.getBlockUsingHash(blockHash)
	res.json({block: block})
})

app.get('/transaction/:transactionId',function(req,res){
	const transactionId = req.params.transactionId
	const correctTransaction = bitcoin.getTransaction(transactionId)
	res.json({transaction: correctTransaction.transaction,
				block: correctTransaction.block})
})

app.get('/address/:address',function(req,res){
	const address = req.params.address
	const addressData = bitcoin.getAddressData(address)
	res.json({transactions: addressData.addressTransactions,
			balance: addressData.addressBalance})
})

app.get('/block-explorer',function(req,res){
	res.sendFile('./block-explorer/index.html',{root: __dirname})
})