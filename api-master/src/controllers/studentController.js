import pg from 'pg';
import Parse from 'csv-parse';
import fs from 'fs-extra';
import axios from 'axios';

// Object created in memory to set the Pool connection with PostgresSQL DB
const config = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    max: process.env.DATABASE_MAX_CONNECTIONS,
    idleTimeoutMillis: process.env.DATABASE_TIME,
};

var pool = new pg.Pool(config);


// Function to create a student
// Will recieve in the body:
//                            the student id
//                            the student name
//                            the student lastname
//                            the student usernames for the judges

export const addStudent = async (req, res) => {
    var userID = req.user._id;

    var studentUsernames = req.body.judges.split(";");
    var studentJudgeIds = "";
    for (let i = 0; i < studentUsernames.length; i++) {
        if (i == 2 && studentUsernames[i] != "") {
            const url = process.env.UVA_GET_ID + studentUsernames[i];
            const response = await axios.get(url);
            studentJudgeIds += response.data;
        }
        studentJudgeIds += ";";
    }
    studentJudgeIds = studentJudgeIds.slice(0, -1);
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_add_student($1, $2, $3, $4, $5, $6)', [userID, req.body.studentID, req.body.studentName, req.body.studentLastName, req.body.judges, studentJudgeIds], function (err, result) {
            done();
            if (err) {
                console.log(err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
            var student;
            for (var i = 0; i < result.rows.length; i++) {
                student = result.rows[i];
            }
            // Return the result from the DB with OK (200) status
            res.status(200).send(student);
        });
    });
}


// Function to delete a student
// Will recieve in the body:
//                            the student unique id

export const deleteStudent = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_delete_students($1, $2)', [userID, req.body.uniqueStudentID], function (err, result) {
            done();
            if (err) {
                console.log(err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
            // Return with OK (200) status
            res.status(200).send();
        });
    });
}


// Function to update a student
// Will recieve in the body:
//                            the student unique id
//                            the student id
//                            the student name
//                            the student lastname
//                            the student usernames for the judges

export const updateStudent = async (req, res) => {
    var userID = req.user._id;

    var studentUsernames = req.body.judges.split(";");
    var studentJudgeIds = "";
    for (let i = 0; i < studentUsernames.length; i++) {
        if (i == 2 && studentUsernames[i] != "") {
            const url = process.env.UVA_GET_ID + studentUsernames[i];
            const response = await axios.get(url);
            studentJudgeIds += response.data;
        }
        studentJudgeIds += ";";
    }
    studentJudgeIds = studentJudgeIds.slice(0, -1);
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_update_student($1, $2, $3, $4, $5, $6, $7)', [userID, req.params.uniqueStudentID, req.body.studentID, req.body.studentName, req.body.studentLastName, req.body.judges, studentJudgeIds], function (err, result) {
            done();
            if (err) {
                console.log(err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
            // Return with OK (200) status
            res.status(200).send();
        });
    });
}


// Function to get all the students based on the user id
// Will recieve in the body:
//                            the group unique id (if it's necessary to filter)

export const getStudentsInfo = async (req, res) => {
    req.setTimeout(1000);
    var userID = req.user._id;

    // Preparing the pool connection to the DB
    const client =  await pool.connect();

    try{    
        // Execution of a queries directly into the DB with parameters
        const studentsResult = await client.query('SELECT * from prc_get_students($1, $2)',[userID, req.body.uniqueGroupID]).catch(err => {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
        });

        var students = [];
        var uniqueStudentsIDs = "";

        for (let i = 0; i < studentsResult.rows.length; i++) {
            students.push(flattenObjectExceptArr(studentsResult.rows[i]));
            uniqueStudentsIDs += students[i]["id"] + ";";
        }
        uniqueStudentsIDs = uniqueStudentsIDs.slice(0, -1);

        const studentsUsernamesResult = await client.query('SELECT * from prc_get_students_usernames($1, $2)',[userID, uniqueStudentsIDs]).catch(err => {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
        });

        var studentsUsernames = [];

        for (let i = 0; i < studentsUsernamesResult.rows.length; i++) {
            studentsUsernames.push(flattenObject(studentsUsernamesResult.rows[i]));
        }
    

        for(var i = 0; i < students.length; i++) {
            var usernames = studentsUsernames.filter(item => item.id == students[i]["id"]);
            
            for (var key in usernames[0]){
                students[i][key] = usernames[0][key];
                
                
            }
        }
        
        // Return the result from the DB with OK (200) status
        client.end();
        res.status(200).send(students);

    } finally{
        client.release()
    }
}


// Function to student profile information
// Will recieve in the body:
//                            the unique student id

export const getStudentProfile = async (req, res) => {

    req.setTimeout(1000);
    var userID = req.user._id;

    // Preparing the pool connection to the DB
    const client =  await pool.connect();

    try{
        // Execution of a queries directly into the DB with parameters
        const studentInfoResult = await client.query('SELECT * from prc_get_student_info($1, $2)',[userID, req.params.uniqueStudentID]).catch(err => {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
        });
        const studentJudgesResult = await client.query('SELECT * from prc_get_student_usernames($1, $2)',[userID, req.params.uniqueStudentID]).catch(err => {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
        });
        const studentProblemsResult = await client.query('SELECT * from prc_get_student_problem($1, $2, $3)',[userID, req.params.uniqueStudentID,req.body.uniqueTagIDs]).catch(err => {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
        });

        var studentInfo = studentInfoResult.rows[0];
        var studentJudges = flattenObject(studentJudgesResult.rows);
        var studentProblems = studentProblemsResult.rows;

        studentInfo["Judges"] = studentJudges;
        var studentProblemsFlattern = [];
        for (let i = 0; i < studentProblems.length; i++) {
            studentProblemsFlattern.push(flattenObjectExceptArr(studentProblems[i]));
        }

        studentInfo["Problems"] = studentProblemsFlattern;

        // Return the result from the DB with OK (200) status
        client.end();
        res.status(200).send(studentInfo);

    } finally{
        client.release()
    }
}


// Function to add a single or multiple students to a single multiple groups 
// Will recieve in the body:
//                            the unique student ids
//                            the unique group id

export const addStudentToGroup = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_add_students_to_groups($1, $2, $3)', [userID, req.body.uniqueStudentsIDs, req.body.uniqueGroupsIDs], function (err, result) {
            done();
            if (err) {
                console.log(err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
            // Return the result from the DB with OK (200) status
            res.status(200).send();
        });
    });
}


// Function to remove a single or multiple students from a single multiple groups 
// Will recieve in the body:
//                            the unique student ids
//                            the unique group id

export const removeStudentfromGroup = (req, res) => {
    var userID = req.user._id;

    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_delete_students_from_groups($1, $2, $3)', [userID, req.body.uniqueStudentsIDs, req.body.uniqueGroupsIDs], function (err, result) {
            done();
            if (err) {
                console.log(err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
            // Return the result from the DB with OK (200) status
            res.status(200).send();
        });
    });
}


// Function to create a single or multiple students from a CSV file
// Will recieve in the file:
//                            the student id
//                            the student name
//                            the student lastname
//                            the student usernames for the judges (Separated by a semicolon)

export const addStudentImported = async (req, res) => {
    var filePath = req.file.path;

    //  Internal function triggered once a line of the CSV file has been read

    async function onNewRecord(record) {
        var studentUsernames = record.jueces.split(";");
        var studentJudgeIds = "";
        for (let i = 0; i < studentUsernames.length; i++) {
            if (i == 2 && studentUsernames[i] != "") {
                const url = process.env.UVA_GET_ID + studentUsernames[i];
                const response = await axios.get(url);
                studentJudgeIds += response.data;
            }
            studentJudgeIds += ";";
        }
        studentJudgeIds = studentJudgeIds.slice(0, -1);

        var userID = req.user._id;
        // Preparing the pool connection to the DB
        pool.connect(function (err, client, done) {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
            // Execution of a query directly into the DB with parameters 
            client.query('SELECT * from prc_add_student($1, $2, $3, $4, $5, $6)', [userID, record.id, record.nombre, record.apellido, record.jueces, studentJudgeIds], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    // Return the error with BAD REQUEST (400) status
                    res.status(400).send(err);
                }
                console.log("Student" + record.id + "created successfully");
            });
        });
        console.log(record)
    }

    //  Internal function triggered if there was an error reading the file

    function onError(error) {
        console.log(error)
    }

    //  Internal function triggered when the file has been read completely

    function done(linesRead) {
        fs.emptyDir("uploads");
        // Return with OK (200) status
        res.status(200).send();
    }

    var columns = true;
    parseCSVFile(filePath, columns, onNewRecord, onError, done);
}

//  Internal function to read a CSV file with the path of the file and callbacks as parameters

function parseCSVFile(sourceFilePath, columns, onNewRecord, handleError, done) {
    var source = fs.createReadStream(sourceFilePath);
    var linesRead = 0;

    var parser = Parse({
        delimiter: ',',
        columns: columns
    });

    parser.on("readable", function () {
        var record;
        while (record = parser.read()) {
            linesRead++;
            onNewRecord(record);
        }
    });

    parser.on("error", function (error) {
        handleError(error)
    });

    parser.on("end", function () {
        done(linesRead);
    });

    source.pipe(parser);
}

const flattenObjectExceptArr = (obj) => {
    const flattened = {}
  
    Object.keys(obj).forEach((key) => {
      if (!Array.isArray(obj[key]) && typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(flattened, flattenObjectExceptArr(obj[key]))
      } else {
        flattened[key] = obj[key]
      }
    })
  
    return flattened
}

const flattenObject = (obj) => {
    const flattened = {}
  
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(flattened, flattenObject(obj[key]))
      } else {
        flattened[key] = obj[key]
      }
    })
  
    return flattened
}

function renameKey ( obj, oldKey, newKey ) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
  }