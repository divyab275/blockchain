const Blockchain = require('./blockchain');


const bitcoin = new Blockchain();

block =  bitcoin.createNewBlock(1211,'3HEHJKADHAKSJ','DSJKFHDSJKFDSF');

// bitcoin.createNewTransaction(12,'DSHFADSJKDSAF','AKSYF7HDASK');
// bitcoin.createNewTransaction(13,'DASD2323JKDSAF','AKSYF7HDASK');

// bitcoin.createNewBlock(9999,'4SDFKJSDFDSD','SHFJKFHKSJ43');

// bitcoin.createNewTransaction(14,'678HJCDJADSF','AKSYF7HDASK');

// bitcoin.createNewBlock(1233,'74YVOIWEURIDF','AYUEWGKF349');

// bitcoin.createNewTransaction(15,'36478SADKKSDFJ','54UDFH');


// console.log(bitcoin.createHash('abc',2,{node:'sda'}));


console.log(bitcoin.proofOfWork('0000ghadgjsed',block))