var async = require('async');
var ConsumerGroup = require('kafka-node').ConsumerGroup;
const fs = require('fs');
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://192.168.120.22:27017/DR";
var operator = require('./Controller/worker')
const perf = require('execution-time')();
var url = "mongodb://localhost:27017/DR";
var MongoClient = require('mongodb').MongoClient;



var consumerOptions = {
    kafkaHost: '192.168.122.66:9092',
    batch: undefined,
    groupId: 'testGroup11',
    sessionTimeout: 15000,
    protocol: ['roundrobin'],
    encoding: 'utf8',
    fromOffset: 'latest',
    commitOffsetsOnFirstJoin: true,
    autoCommit: true,
    outOfRangeOffset: 'earliest',
    fetchMaxBytes: 15728640,
    onRebalance: (isAlreadyMember, callback) => { callback()}
};

var consumerGroup = new ConsumerGroup(consumerOptions, 'Normal');
consumerGroup.on('message', onMessage);
consumerGroup.on('error', (err) => {
  console.log(`error on consumerGroup`);
  console.log(err);
});


async function onMessage (message) {
  // console.log(message.value);
  var messageValue = JSON.parse(JSON.stringify(message.value));
  var obj = JSON.parse(messageValue);
  perf.start();
  // await operator.sendToAIS(obj)
  await insertDb(obj)
  await operator(messageValue);
  
  const results = perf.stop();
  console.log('Insert to mongoDB take time: ',results.time);
}


async function insertDb(obj){
  const query = await MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true})
  try {
    var db = query.db("SMS");
    let collection = db.collection('smid');
    let insert = await collection.insertMany(obj);
    console.log(insert.insertedCount)
  } catch (err) {
      console.log(err);
  }
}




