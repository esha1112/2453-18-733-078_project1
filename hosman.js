const express=require('express');
const app=express();
//bodyparser
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

let server=require('.server.js');
let middleware=require('./middleware.js');

const MongoClient=require('Mongodb').MongoClient;
const url='mongodb://127.0.0.1:27017';
const dbname="hosman";
let db;
MongoClient.connect(url,function(err,client){
    if(err) return console.log(err);
    db=client.db(dbname);
    console.log(`connected database: ${url}`);
    console.log(`Database:${dbname}`);
    console.log('hey there connected');
});
//hospital details
app.get('/hospital', middleware.checkToken,function(req,res)
{
    console.log("fetching hospital details");
    var data=db.collection("hospital").find().toArray().then(result=>res.json(result));
});
//ventilator details
app.get('/ventilator',middleware.checkToken,function(req,res)
{
    console.log("fetching ventilator details");
    var data=db.collection("ventilators").find().toArray().then(result=>res.json(result));
});
//searching ventilator by status
app.post('/searchvbs',middleware.checkToken,function(req,res)
{
    var status=req.body.status;
    console.log(status);
    var ventilatordetails=db.collection("ventilators").find({'status':status }).toArray().then(result=>res.json(result));
});
//searching ventilator by name
app.post('/searchvbn',middleware.checkToken,function(req,res)
{
    var name=req.body.name;
    console.log(name);
    var ventilatordetails=db.collection("ventilators").find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});


//update vent status
app.put('/updateventilator',middleware.checkToken,function(req,res)
{
    var ventId={ventilatorId: req.body.ventilatorId};
    var value={$set:{status:req.body.status}};
    db.collection("ventilators").updateOne(ventId,value,function(err,result)
    {
        res.json('1 doc updates');
        if(err) throw err;
    });
});
// Adding ventilator 
app.post('/addventilator', middleware.checkToken,function(req,res)
 {
    var name=req.body.name;
    var hId=req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var item=
    {
        hId:hId, ventilatorId:ventilatorId, status:status, name:name
    };
    db.collection("ventilators").insertOne(item, function(err, result)
    {
        res.json('Item inserted');
        if (err) throw err;
    });
});
//delete a vent
app.delete('/deletevent',middleware.checkToken,function(req,res)
{
    var item=
    {ventilatorId: req.body.ventilatorId};
    db.collection("ventilators").deleteOne(item,function(err,result)
    {
        res.json('Item deleted');
        if (err) throw err;
    });
});
app.listen(9000,function(req,res)
{
    console.log("listening..");
});