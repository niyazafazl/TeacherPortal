
var _ = require('lodash');
const moment = require('moment');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'Assessment'
});

 /**
    Function to retieve list of teachers from DB
  **/
exports.listTeachers = function(req, res) {
  try {
    var selectTeacherquery = "SELECT * FROM teachers";
    connection.query(selectTeacherquery, function (error, results, fields) {
      if (error) {
        console.log("error ocurred",error);
        res.send({
          "code":400,
          "failed":"error ocurred"
        })
      }else{
        console.log('Teacher list: ', results);
        res.send({
          "code":204,
          "results":results
            });
      }
    });
  } catch(error) {
    console.log('error ', error);
  }
}

/**
    Function to login as teacher
  **/
exports.teacherLogin = function(req, res, next) {
  try {
    console.log('Calling teacher login Api ...... body ', req.body);
    var email= req.body.email;
    var password = req.body.password;
    connection.query('SELECT * FROM teachers WHERE teacher_email = ?',[email], function (error, results, fields) {
      if (error) {
        // console.log("error ocurred",error);
        res.send({
          "code":400,
          "failed":error
        })
      }else{
         console.log('The solution is: ', results);
        if(results && results.length >0){
          if(results[0].password == password){
            res.send({
              "code":200,
              "success":"login sucessfull"
                });
          }
          else{
            res.send({
              "code":400,
              "success":"Email and password does not match"
                });
          }
        }
        else{
          res.send({
            "code":400,
            "success":"Email does not exits"
              });
        }
      }
    })
  } catch(error) {
    console.log('error ', error);
  }
}

/**
    Function for the teacher to be able to register one or more students to the specified teacher's account
  **/
exports.studentRegister = function(req, res, next) {
  try{
    console.log('Calling Student register Api ...... ', req.body);
    var request = req.body;
    var selectTeacherquery = "SELECT * FROM teachers WHERE teacher_id='" + request.teacher_id + "';";
    
    connection.query(selectTeacherquery, function (error, teacherResults, fields) {
      console.log('results from teacher ', teacherResults);
      if(teacherResults && teacherResults.length > 0) {
        let teacher_id = teacherResults[0].teacher_id;
        var students = req.body.students;
        var studentMainArr = [];
        var studentEmails = [];
        console.log('students from req ', students);
      
        // put all the student emails in this array to check for the uniqu validation
        var studentEmails = students.map(function(el) { return el.student_email; });
        console.log('studentEmails ', studentEmails);
        /* Query to find out those students who already assigned to this Teacher */
        connection.query('SELECT * FROM students WHERE student_email IN (' + Array(studentEmails.length ).join('?').split('').join(',') + ')', [studentEmails], function (studentError, studentResult, studentFields) {
          console.log('student already exist ', studentResult);
          var studentsToRegister = [];
           if (studentError) {
            console.log("error ocurred",studentError);
           
          }else{
            console.log('Successfully queried to get the student ');
            for(var i=0; i < students.length; i++){
              /* To check if the student is not already present for this teacher*/
              var studentExist = _.find(studentResult, (studentObj) => {
                //console.log('student email ' + studentObj.student_email +  "  " + students[i].student_email + " teacher id "+teacher_id + " "+studentObj.teacher_id);
                return (studentObj && studentObj.student_email == students[i].student_email)  && (studentObj && studentObj.teacher_id == teacher_id);
              });
              console.log('student Not Exist ------------------- ', _.isEmpty(studentExist));
              if(_.isEmpty(studentExist)) {
                //not exist put into the array
                let studentsRegObj = {};
                studentsRegObj.student_email = students[i].student_email;
                studentsToRegister.push(studentsRegObj);
              }

            }
            console.log('studentsToRegister ------------------- ', studentsToRegister);
            if(studentsToRegister && studentsToRegister.length > 0) {
              /* Create the main array only with the students who not exist  for the given teacher */
              /* Make the studentMainArr in this format,
                [ 'roland@test.com', 2, 'active' ],
                [ 'jim@test.com', 2, 'active' ] ]
              */
              for(var i=0; i< studentsToRegister.length; i++) {
                var studentArr = [];
                studentArr.push(studentsToRegister[i].student_email, teacher_id, 'active');
                studentMainArr.push(studentArr);
              }
            }
            console.log('studentMainArr ------------------- ', studentMainArr, ' size ', studentMainArr.length);
           
            if(studentMainArr.length > 0) {
              connection.query('INSERT INTO students (student_email, teacher_id, status) VALUES ?',[studentMainArr], function (error, results, fields) {
                if (error) {
                  console.log("error ocurred",error);
                  res.send({
                    "code":400,
                    "failed":"error ocurred"
                  })
                }else{
                  console.log('The solution is: ', results);
                  res.send({
                    "code": 200,
                    "success": results
                  })
                }
              });

            } else {
              console.log('Student already registered for this teacher ******************');
              res.send({
                "code": 400,
                "error": "Student already registered for this teacher"
              })
            }
          }
          
        });
      } else {
        /*Teacher not exist */
        res.send({
          "code":400,
          "failed":"The teacher selected not exist in our DB"
        }) 
      }
      
    });
  }
  catch(error){
    console.log(error);
  }
}

/**
    Function to retrieve list of students by teacher's account
  **/
exports.studentListByTeacher = function(req, res, next) {

  try{
    console.log('Calling Student list Api ...... ', req.query.teachers);
    
    var listStudentquery = "SELECT * FROM students WHERE teacher_id IN (" + req.query.teachers + ")";
    console.log('listStudentquery ', listStudentquery);
    connection.query(listStudentquery, function (error, studentList, fields) {
      if (error) {
        console.log("error ocurred",error);
        res.send({
          "code":400,
          "failed":"error ocurred"
        })
      }else{
        console.log('List students ', studentList);
        res.send({
          "code": 200,
          "data": studentList
        })
      }
    });
  }
  catch(error){
    console.log(error);
  }
}

/**
    Function to retrieve list of students for the current logged in teacher's account
  **/
exports.listMyStudent = function(req, res, next) {
  try{
    console.log('Calling My Student list Api ...... ', req.query.teacher_email);
    var listMyStudentquery = "SELECT * FROM teachers JOIN students ON students.teacher_id = teachers.teacher_id WHERE teachers.teacher_email = '" + req.query.teacher_email + "'";

    console.log('listMyStudentquery ', listMyStudentquery);
    connection.query(listMyStudentquery, function (error, studentList, fields) {
      if (error) {
            console.log("error ocurred",error);
            res.send({
              "code":400,
              "failed":"error ocurred"
            })
          }else{
            console.log('List students ', studentList);
            res.send({
              "code": 200,
              "data": studentList
            })
          }
    });
  }
  catch(error){
    console.log(error);
  }
}

/**
    Function to suspend students by the current logged in teacher's account
  **/
exports.suspendStudent = function(req, res, next) {
  try {
    console.log('Calling Student suspend Api ...... ', req.body.students);
    var updateStudentQuery = "UPDATE students SET status = 'suspended' WHERE student_id IN (" + req.body.students + ")";
    console.log('updateStudentQuery ', updateStudentQuery);
    connection.query(updateStudentQuery, function (error, studentSuspendData, fields) {
      if (error) {
            console.log("error ocurred",error);
            res.send({
              "code":400,
              "failed":"error ocurred"
            })
          }else{
            console.log('studentSuspendData ', studentSuspendData);
            res.send({
              "code": 200,
              "data": studentSuspendData
            })
          }
    });
  } catch (error) {
    console.log(error)
  }
}

/**
    Function to send notification to students by the current logged in teacher's account
  **/
exports.retrievefornotifications = function(req, res, next) {
  try {
    
    var students = req.body.students;
    console.log('Calling Notification Api ....... ', req.body);
    var notificationArr = [];

    connection.query('SELECT * FROM students WHERE status="active" and student_id IN (' + [students] + ')', function (error, studentActiveList, fields) {
      if (error) {
        console.log("error ocurred",error);
        res.send({
          "code":400,
          "failed":"error ocurred"
        })
      }else{
        console.log('studentActiveList ', studentActiveList);
        if(studentActiveList && studentActiveList.length > 0){
          for(var i=0; i< studentActiveList.length; i++) {
          var notificationInnerArr = [];
            notificationInnerArr.push(req.body.teacher, studentActiveList[i].student_email, req.body.notification);
            notificationArr.push(notificationInnerArr);
          }
          var notificationQuery = "INSERT INTO notifications (teacher_email, students, message) VALUES ?";
          console.log('notificationQuery ', notificationQuery);
          connection.query(notificationQuery, [notificationArr], function (error, studentNotifications, fields) {
            if (error) {
                  console.log("error ocurred",error);
                  res.send({
                    "code":400,
                    "failed":"error ocurred"
                  })
                }else{
                  console.log('studentNotifications ', studentNotifications);
                  res.send({
                    "code": 200,
                    "data": studentNotifications
                  })
                }
          });
        }
      }
    })
  } catch(error) {
    console.log(error);
  }
}

