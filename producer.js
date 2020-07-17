'use strict';
var fs = require('fs');
var kafka = require('kafka-node');
var Producer = kafka.HighLevelProducer;
var KeyedMessage = kafka.KeyedMessage;
var Client = kafka.KafkaClient;
var client = new Client({ kafkaHost: '192.168.122.66:9092' });
var producer = new Producer(client, { requireAcks: 'all' });
var url = "mongodb://localhost:27017/DR";
var MongoClient = require('mongodb').MongoClient;
var i;
var obj =[];
for (i = 0; i < 5000; i++){
  obj.push({
    messages : i.toString(),
    status: null,
  })
}

var topicsToCreate = [{
  topic: 'Normal',
  partitions: 3,
  replicationFactor: 3
},
{
  topic: 'Premium',
  partitions: 3,
  replicationFactor: 3,
},
{
  topic: 'DR',
  partitions: 3,
  replicationFactor: 3,
},
{
  topic: 'SMID',
  partitions: 3,
  replicationFactor: 3,
}]

// client.createTopics(topicsToCreate, (error, result) => {
//   console.log('eiei',result)
//   // result is an array of any errors if a given topic could not be created
// });


var json = JSON.stringify(obj);
console.log(json)



producer.on('ready',async function () {
  const query = await MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true})
  try {
    var db = query.db("DR");
    let collection = db.collection('smid');
    let insert = await collection.insertMany(obj);
    console.log(insert.insertedCount)
  } catch (err) {
      console.log(err);
  }
    console.log('ready')
    producer.send([{topic: 'Normal',messages: json , attributes: 1}], function (
      err,
      result
    ) {
      console.log(err || result);
      process.exit();
    });
});

producer.on('error', function (err) {
  console.log('error', err);
});

