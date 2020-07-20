// const { insertSMID } = require("./controllerSendTopicToKafka")
const axios = require('axios');
const faker = require('faker');
const moment = require('moment')
const fs = require('fs')
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
const MAX_REQUESTS_COUNT = 200
const INTERVAL_MS = 10
let PENDING_REQUESTS = 0
// create new axios instance
var url = "mongodb://localhost:27017";
var MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url)
const connection = client.connect()

const api = axios.create({})
const defauleParamsAIS = {
    CMD: "SENDMSG",
    FROM: "SMSMKT.COM",
    TO: "",
    REPORT: "Y",
    CHARGE: "Y",
    CODE: "ClickNext_BulkSMS",
    CTYPE: "TEXT",
    CONTENT: "",
    EXPIRE: "200605123903"
};
/**
 * Axios Request Interceptor
 */
api.interceptors.request.use(function (config) {
    return new Promise((resolve, reject) => {
        // console.log(config)
        let log = `start : ${moment().format('YYYY-MM-DD HH:mm:ss')}\n`
        let interval = setInterval(() => {
            if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
                PENDING_REQUESTS++
                clearInterval(interval)
                resolve(config)
            }
        }, INTERVAL_MS)
    })
})

/**
 * Axios Response Interceptor
 */
api.interceptors.response.use(async (response) => {
    console.log(response.config.url);
    // PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)

    let log = `end : ${moment().format('YYYY-MM-DD HH:mm:ss')}\n`
    const payload = {
        status: response.data.status < 8 ? 'success':'fail',
        message: '',
        operater: 'AIS'
    }
    
    // // insertSMID("InsertSMID", payload,producerInstance)
    setTimeout(function() {

    },1000)
    const query = await MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true})
    // console.log(payload);
    try {
        var db = await query.db("SMS");
        let collection = await db.collection('sms_data');
        let insertSMID = await collection.insertOne(payload);
    } catch (err) {
        console.log(err);
    } finally{
    }
    // return Promise.resolve(response.data)
    // const query = await MongoClient.connect(url,{useNewUrlParser: true, useUnifiedTopology: true})
    // console.log(payload);
    // try {
    //     var db = query.db("SMS");
    //     let collection = db.collection('sms_data');
    //     var myquery = { smid: payload.smid };
    //     var newvalues = {$set: {status: payload.status} };
    //     let insertSMID = await collection.updateOne(myquery,newvalues);
    // } catch (err) {
    //     console.log(err);
    // } finally{
    //     query.close();
    // }
    // return Promise.resolve(response.data)
}, function (error) {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1)
    return Promise.reject(error)
})

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

const convertXMLToJSON = (xml) => {
    return new Promise((resolve, reject) => {
        try {
            parseString(xml, function (err, result) {
                resolve(result)
            });
        } catch (error) {
            reject(error)
        }
    })
}

const sendToAIS = (params) => {
    
    try {
        for (let i = 0; i < params.length; i++) {
            
            // params.TO = `${i}`
            // params.CONTENT = `${faker.address.city()} ${faker.address.state()}`
            let params_str = getParams(params[i])
            console.log(params_str)

            api.get(`http://localhost:3000/?${params_str}`)
           
        }
    } catch (error) {
        console.log('error : ', error)
    }

}


module.exports.sendToAIS = sendToAIS;
