#!/usr/bin/env node
const fs = require('fs');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var appMySql = require('./server/app/app-mysql.js');

const PORT = process.env.PORT || 5156

const app = express();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'Assessment'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");
} else {
    console.log("Error connecting database ... nn");
}
});
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/client/src/app/login.html'));
});
app.get('/index.html', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/client/src/app/index.html'));
});
app.use(express.static(path.join(__dirname+ '/client')));

app.listen(
  PORT,
  err => err
    ? console.error('Unable to start Dev Assessment', err)
    : console.warn(`Dev Assessment listening on ${PORT}`)
);

app.post('/api/login', appMySql.teacherLogin);
app.get('/api/teachers', appMySql.listTeachers);
app.post("/api/register"
      , bodyParser.json()
      , appMySql.studentRegister);

app.get('/api/studentListByTeacher', appMySql.studentListByTeacher);
app.get('/api/listMyStudent', appMySql.listMyStudent);
app.post('/api/suspend', appMySql.suspendStudent);
app.post('/api/retrievefornotifications'
  , bodyParser.json()
  , appMySql.retrievefornotifications);


module.exports = app;