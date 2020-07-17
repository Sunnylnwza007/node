var async = require('async');
var ConsumerGroup = require('kafka-node').ConsumerGroup;
const fs = require('fs');
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";
const axios = require('axios');
const perf = require('execution-time')();
const api = axios.create({})

//Producer



var consumerOptions = {
  kafkaHost: '192.168.122.59:9092',
  groupId: 'ExampleTestGroup5',
  sessionTimeout: 15000,
  protocol: ['roundrobin'],
  auttoCommit: true,
  fromOffset: 'earliest', // equivalent of auto.offset.reset valid values are 'none', 'latest', 'earliest'
  'reconnect.backoff.ms': 100,
  'reconnect.backoff.max.ms': 1000
};

var topics = ['test','test2'];

var consumerGroup1 = new ConsumerGroup(consumerOptions, 'test');
consumerGroup1.on('message', onMessage);
consumerGroup1.on('error', function (err) {
    console.log('error', err);
  });

// var consumerGroup2 = new ConsumerGroup(consumerOptions, 'test2');
// consumerGroup2.on('message', onMessage);
// consumerGroup2.on('error', function (err) {
//     console.log('error', err);
// });

async function checkOperator(message){
  var obj = JSON.parse(message.value);
  // console.log(obj);

  // insert temp
  const query = await MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true})
  try {
    var db = query.db("mydb");
    let collection = db.collection('sms');
    let insert = await collection.insertMany(obj);
    console.log(insert.insertedCount)
  } catch (err) {
      console.log(err);
  }
  
  // update status
  // const query3 = await MongoClient.connect(url)
  
  // for (var item in obj){
  //   if(obj[item].operator =='true'){
  //    obj[item].status = operatorTrue(obj[item])
  //   }else if(obj[item].operator =='ais'){
  //     obj[item].status = operatorAis(obj[item])
  //   }
  
  //   try {
  //     var db = query.db("mydb");
  //     let collection = db.collection('sms');
  //     let insert = await collection.updateOne({messages:obj[item].messages},{ $set: {status:obj[item].status}});
  //     console.log(item)
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }


  perf.start();


  query.close();
  const results = perf.stop();
  console.log('Insert to mongoDB take time: ',results.time);  // in milliseconds
    
    

  // insert after update status
  // const query2 = await MongoClient.connect(url)
  // try {
  //   var db = query2.db("mydb");
  //   let collection = db.collection('smsStatus');
  //   let res = await collection.drop();
  //   let insert = await collection.insertMany(obj);
  //   console.log('test')
  // } catch (err) {
  //     console.log(err);
  // } finally {
  //     query2.close();
  // }

  // MongoClient.connect(url, function(err, db) {
  //   if (err) throw err;
  //   var dbo = db.db("mydb");
  //   dbo.collection("sms").find({status: 'success'}).toArray(function(err, result) {
  //     if (err) throw err;
  //     db.close();
  //   });
  // });
  
}

function operatorTrue(obj){
  // console.log(message)
  // fs.appendFile('Test1/true.txt', obj.messages+'\n', function (err) {
  //   if (err) return 'fail';
    
  // });
  if (Math.floor(Math.random() * 10) < 8){
    return 'success';
  } else {
    return 'fail';
  }
}

function operatorAis(obj){
  // console.log(message)
  // fs.appendFile('Test1/ais.txt', obj.messages+'\n', function (err) {
  //   if (err) return 'fail';
    
  // });
  if (Math.floor(Math.random() * 10) < 8){
    return 'success';
  } else {
    return 'fail';
  }
  
}

async function onMessage (message) {

  const query = await MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true})
  try {
    var db = query.db("mydb");
    let collection = db.collection('sms');
    var drop = await collection.drop()
    console.log(drop)
    let create = await db.createCollection('sms')
  } catch (err) {
      console.log(err);
  }
    checkOperator(message)
    // console.log(message.topic)
    
}

