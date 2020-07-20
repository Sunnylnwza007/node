
'use strict';
const { Worker, isMainThread, parentPort,workerData } = require('worker_threads');
const numCPUs = require('os').cpus().length;
const _ = require('lodash');
const axios = require('axios');
const api = axios.create({})
var url = "mongodb://localhost:27017";
var MongoClient = require('mongodb').MongoClient;


const getParams = (options) => {
  let txt = ""
  let index = 0;
  for (const key in options) {
      txt += `${key}=${options[key]}`
      if (index !== (Object.keys(options).length - 1)) txt += "&"
      index++;
  }
  // console.log(txt)
  return txt
}

let sentToOperator = (query,obj)=>{
  let params_str = getParams(obj)
  // console.log(params_str)
  api.get(`http://localhost:3000/?${params_str}`).then(function (response){
    const payload = {
      status: response.data.status,
      message: '',
      operater: 'AIS'
    }
    console.log(params_str)
    try {
          var db = query.db("SMS");
          let collection = db.collection('smid');
          var myquery = { messages: obj.messages};
          var newvalues = {$set: {status: payload.status} };
          let insertSMID = collection.updateOne(myquery,newvalues);
      } catch (err) {
          console.log(err);
      } finally{
          // query.close();
      }
  }).catch(function (error) {
    // handle error
    console.log('api',error);
  })
}

let  operator = async (obj)=>{
  let data = JSON.parse(obj)
  var chunk = _.chunk(data,(data.length/(numCPUs/2)))
  var query = await MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true})
  const threads = new Set();

    // if (isMainThread) {
      for (let i = 0;i<chunk.length;i++){
          for (let j =0;j<chunk[i].length;j++){
            // console.log(chunk[i][j].messages);
            sentToOperator(query,chunk[i][j])
          }
      }
      // Listen for messages from the worker and print them.
      // worker.on('message', (msg) => { console.log(msg); });
    // } else {
      // This code is executed in the worker and not in the main thread.
      // console.log(isMainThread)
      // Send a message to the main thread.
      // parentPort.postMessage('Hello');
    // }
  }

module.exports = operator