'use strict';
const { Worker, isMainThread, parentPort,workerData } = require('worker_threads');
const axios = require('axios');
const api = axios.create({})
var url = "mongodb://localhost:27017/";
var MongoClient = require('mongodb');
var conn = MongoClient.connect(url,{ useUnifiedTopology: true })
// var mongoose = require("mongoose")
var query = '';

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
  
  let sentToOperator = async (obj)=>{
    let params_str = getParams(obj)
    let status = null;
    // console.log(params_str)
    await api.get(`http://127.0.0.1:2345/?${params_str}`,{ proxy: { host: '127.0.0.1', port: 2345 } }).then(function (response){
      const payload = {
        status: response.data.status,
        message: '',
        operater: 'AIS'
      }
    try {
        conn.then(function (client){ 
            var db = client.db("SMS");
            let collection = db.collection('smid')
            var myquery = { messages: obj.messages};
            var newvalues = {$set: {status: payload.status} };
            let insertSMID = collection.updateOne(myquery,newvalues);
            }
        )
    } catch (err) {
        console.log('db',err);
    } finally{
        // query.close();
    }

    }).catch(function (error) {
      // handle error
      console.log('api',error);
    })    
  }


// var db = null;

// MongoClient.connect('url', function(err, client) {
//     if(err) { console.error(err) }
//     db = client.db('SMS') // once connected, assign the connection to the global variable
// })

for (let i = 0; i < workerData.data.length; i++) {
    sentToOperator(workerData.data[i])
}




parentPort.postMessage(workerData.data);