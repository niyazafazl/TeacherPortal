var supertest = require('supertest');
var colors = require('colors');


describe("Application -", function() {

 
  beforeAll(function() {
    console.log("Suite [START] : --- APPLICATION ---".blue.bold);

     app = require('../index.js');
     this.request = supertest(app);
  });
  afterAll(function() {
    console.log("Suite [END] : --- APPLICATION ---".blue.bold);
  });

  describe("1. Teacher Portal-", function() {

    it("1.1 Teacher login", function(done) {
      /**
      Remarks:
        Able to login using teacher's account
      **/
      this.request
        .post("/api/login")
        .type('form')
        .send(JSON.stringify({'email': 'zetty@gmailtest.com',
                'password': 'password'
              }))
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });

    it("1.2 List teacher", function(done) {
      /**
      Remarks:
        Retrieve the list of teachers
      **/
      this.request.get("/api/teachers/")
        .expect(200).then(response => {
          console.log("Info: 1.2 List teacher, ".blue, response.body);
          expect(response.body.length).not.toEqual(0);
          done();
        });
    });

    it("1.3 Student Register", function(done) {
      /**
      Remarks:
      As a teacher, able to register one or more students to the teacher's account
      **/
      this.request.post("/api/register")
        .type('form')
        .send(JSON.stringify({ 'teacher_id': '1',
            'students': 
             [ { 'student_email': 'zul@test.com' },
               { 'student_email': 'abu@test.com' } ] }))
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          } else {
            console.log('1.3 Student Register ', res.text);
          }
          done();
        });
    });

    it("1.4 Retrieve Student by Teacher ", function(done) {
      /**
      Remarks:
        Retrieve the list of students for the specified teacher's account
      **/
      var teacherIds = [1,2];
      this.request.get("/api/studentListByTeacher?teachers[]=1&teachers[]=2")
        .expect(200).then(response => {
          console.log("1.4 Retrive Student by Teacher ".blue, response.body);
          expect(response.body.length).not.toEqual(0);
          done();
        });
    });
    it("1.5 Retrieve My Student by Teacher Email address ", function(done) {
      /**
      Remarks:
        Retrieve the the list of my students from current logged in teacher's account
      **/
      this.request.get("/api/listMyStudent?teacher_email=zetty@gmailtest.com")
        .expect(200).then(response => {
          console.log("1.5 Retrieve My Student by Teacher Email address ".blue, response.body);
          expect(response.body.length).not.toEqual(0);
          done();
        });
    });

    it("1.6 Teacher suspend Students", function(done) {
      /**
      Remarks:
      As a teacher, suspend a specified student
      **/
      this.request.post("/api/suspend")
        .type('form')
        .send(JSON.stringify({'status':'suspended',
                          'students': [8 , 78]})
         )
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          } else {
            console.log('1.6 Student suspended successfully ', res.text);
          }
          done();
        });
    });

    it("1.7 Teacher send notifications to Students", function(done) {
      /**
      Remarks:
      As a teacher, able to send Notifications to students
      **/
      this.request.post("/api/retrievefornotifications")
        .type('form')
        .send(JSON.stringify({'teacher':'zetty@gmailtest.com',
              'students': [ '90', '89' ],
              'notification': 'This is testing from Jasmine'
              })
         )
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          } else {
            console.log('1.7 Teacher send notifications to Students successfully ', res.text);
          }
          done();
        });
    });
  });

})
