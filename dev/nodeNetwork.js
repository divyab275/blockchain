const express = require('express');
const BlockChain = require('./blockchain');
const bodyParser = require('body-parser');
const app = express();
const uuid = require('uuid/v1');
const bitcoin = new BlockChain();
const nodeAddress = uuid().split('-').join('');
const port = process.argv[2];
const rp = require('request-promise');
//var Promise = require('es6-promise').Promise;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
 
app.get('/blockchain', function (req, res) {
  res.send(bitcoin);
});

app.post('/transaction', function (req, res) {
  const index = bitcoin.createNewTransaction(req.body.amount,req.body.sender,req.body.receiver);
  res.json({'note':`The transaction will be added to ${index}  block.`});

});

app.get('/mine', function (req, res) {
	const lastBlock = bitcoin.getLastBlock();
	const previousHash = lastBlock['hash'];
	const currBlockData = {
		transaction : bitcoin.pendingTransactions,
		index : lastBlock['index']+1
	}
	const nonce = bitcoin.proofOfWork(previousHash,currBlockData);
	const currentHash = bitcoin.createHash(previousHash,nonce,currBlockData);
	bitcoin.createNewTransaction(12.5,'00',nodeAddress)
  	const newBlock = bitcoin.createNewBlock(nonce,currentHash,previousHash)
  	res.json({note:"New block mined successfully",
  			  block:newBlock	})
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