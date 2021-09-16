import pg from 'pg';
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


// Function to update a problem
// Will recieve in the body:
//                            the unique problem id
//                            the new problem comment

export const updateProblem = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_update_problem($1, $2, $3)', [userID, req.params.uniqueProblemID, req.body.problemComment], function (err, result) {
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


// Function to get all the problem based on the user id
// Will recieve in the body:
//                            the unique judge ids (if it's necessary to filter)
//                            the unique tags ids (if it's necessary to filter)

export const getProblemsInfo = (req, res) => {
    var userID = req.user._id;

    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_get_problems($1, $2, $3)', [userID, req.body.uniqueJudgesIDs, req.body.uniqueTagsIDs], function (err, result) {
            done();
            if (err) {
                console.log(err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }

            var problems = [];
            for (let i = 0; i < result.rows.length; i++) {
                problems.push(flattenObjectExceptArr(result.rows[i]));

            }

            // Return the result from the DB with OK (200) status
            res.status(200).send(problems);
        });
    });
}


// Function to get judges names for the filter

export const getJudges = (req, res) => {
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_get_judges_names()', [], function (err, result) {
            done();
            if (err) {
                console.log(err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
            // Return the result from the DB with OK (200) status
            res.status(200).send(result.rows);
        });
    });
}


// Function to add a single or multiple tags to a single or multiple problems
// Will recieve in the body:
//                            the unique tag ids
//                            the unique problem ids

export const addTagToProblem = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_add_tags_to_problems($1, $2, $3)', [userID, req.body.uniqueTagsIDs, req.body.uniqueProblemsIDs], function (err, result) {
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


// Function to remove a single or multiple tags from a single or multiple problems
// Will recieve in the body:
//                            the unique tag ids
//                            the unique problem ids

export const removeTagfromProblem = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_delete_tags_from_problems($1, $2, $3)', [userID, req.body.uniqueTagsIDs, req.body.uniqueProblemsIDs], function (err, result) {
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

//  Internal function with a promise to create a delay with the desired time in miliseconds as parameter

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to synchronize all the problems associated to any student based on the user id

export const syncProblems = async (req, res) => {
    var userID = req.user._id;

    // Preparing the pool connection to the DB
    const client =  await pool.connect();
    try{
        // Execution of a queries directly into the DB with parameters
        const studentsJudgeCodeForcesResult = await client.query('SELECT * from prc_get_students_judge($1, $2)', [userID, "CodeForces"]).catch(err => {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
        });
        const studentsJudgeCodeChefResult = await client.query('SELECT * from prc_get_students_judge($1, $2)', [userID, "CodeChef"]).catch(err => {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
        });
        const studentsJudgeUVAResult = await client.query('SELECT * from prc_get_students_judge($1, $2)', [userID, "UVA"]).catch(err => {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
        });

        var studentsJudgeCodeForces = [];
        var studentsJudgeCodeChef = [];
        var studentsJudgeUVA = [];

        if (studentsJudgeUVAResult.rows.length == studentsJudgeCodeChefResult.rows.length && studentsJudgeCodeChefResult.rows.length == studentsJudgeCodeForcesResult.rows.length){
            for (let i = 0; i < studentsJudgeUVAResult.rows.length; i++) {
                studentsJudgeUVA.push(flattenObject(studentsJudgeUVAResult.rows[i]));
                studentsJudgeCodeChef.push(flattenObject(studentsJudgeCodeChefResult.rows[i]));
                studentsJudgeCodeForces.push(flattenObject(studentsJudgeCodeForcesResult.rows[i]));
            }
        } else {
            throw err;
        }
    
        const [codeForcesResult, codeChefResult, uvaResult] = await Promise.all([codeForcesAPICall(userID, studentsJudgeCodeForces),
        codeChefAPICall(userID, studentsJudgeCodeChef),
        uvaAPICall(userID, studentsJudgeUVA)]);

        console.log("The API calls were completed");
        // Return the result from the DB with OK (200) status
        client.end();
        res.status(200).send();

    } finally{
        client.release()
    }
}


//  Internal function to make the calls to the CodeForces API and retrieve the problems solved for each student 
//      with the user id and the students information as parameters

async function codeForcesAPICall(userID, studentsJudgeCodeForces) {
    var judgeName = "CodeForces";
    for (let i = 0; i < studentsJudgeCodeForces.length; i++) {
        if (studentsJudgeCodeForces[i]["studentUsername"] != "") {
            const url = process.env.CODEFORCES_GET_USERS;
            const options = {
                params: { handle: studentsJudgeCodeForces[i]["studentUsername"] }
            };

            try {
                const response = await axios.get(url, options);
                var studentProblems = response.data["result"].filter(item => item.verdict == "OK");
                var problems = "";
                for (let j = 0; j < studentProblems.length; j++) {
                    problems += studentProblems[j]["problem"]["contestId"] + studentProblems[j]["problem"]["index"] + ";";
                }
                problems = problems.slice(0, -1);
                // Preparing the pool connection to the DB
                pool.connect(function (err, client, done) {
                    if (err) {
                        console.log("Not able to stablish connection: " + err);
                    } else {
                        //-- esto es para sincronizar los problemas resueltos por un estudiante, si el problema ya existen la DB solo se asocia que el estudiante lo resolvio
                        // Execution of a query directly into the DB with parameters
                        client.query('SELECT * from prc_update_student_problems($1, $2, $3, $4)', [userID, studentsJudgeCodeForces[i]["studentId"], judgeName, problems], function (err, result) {
                            done();
                            if (err)
                                console.log(err);
                        });
                    }
                });

            } catch (err) {
                console.log(err);
                let error = "There was an error during the API query: " + err;
                // Preparing the pool connection to the DB
                pool.connect(function (err, client, done) {
                    if (err) {
                        console.log("Not able to stablish connection: " + err);
                    } else {
                        // Execution of a query directly into the DB with parameters
                        client.query('SELECT * from prc_add_student_log($1, $2, $3, $4)', [userID, studentsJudgeCodeForces[i]["studentId"], studentsJudgeCodeForces[i]["studentUsername"], error], function (err, result) {
                            done();
                            if (err)
                               console.log(err);
                        });
                    }
                });
            }

            var count = i + 1;
            if (count > 1 && count % 5 == 0) {
                console.log("delay");
                await sleep(1000);
            }
        } else {
            continue;
        }
    }
}


//  Internal function to make the calls to the CodeChef API and retrieve the problems solved for each student 
//      with the user id and the students information as parameters

async function codeChefAPICall(userID, studentsJudgeCodeChef) {
    var judgeName = "CodeChef";
    try {
        var data = JSON.stringify({ "grant_type": "client_credentials", "scope": "public", "client_id": process.env.CLIENT_ID, "client_secret": process.env.CLIENT_SECRET, "redirect_uri": process.env.CODECHEF_REDIRECT_URI });

        const url = process.env.CODECHEF_GET_TOKEN;
        const headers = {
            headers: { "content-type": "application/json" },
        };

        const response = await axios.post(url, data, headers);
        const token = response.data["result"]["data"]["access_token"];

        for (let i = 0; i < studentsJudgeCodeChef.length; i++) {
            if (studentsJudgeCodeChef[i]["studentUsername"] != "") {
                const url = process.env.CODECHEF_GET_USERS + studentsJudgeCodeChef[i]["studentUsername"];
                const options = {
                    params: { fields: "problemStats" },
                    headers: {
                        "Accep": "application/json",
                        "Authorization": "Bearer " + token
                    },
                };

                try {
                    const response = await axios.get(url, options);
                    var studentProblems = response.data["result"]["data"]["content"]["problemStats"]["solved"];
                    var problems = "";

                    for (var key in studentProblems) {
                        problems += studentProblems[key].join(";");
                        if (problems != "")
                            problems += ";";
                    }
                    problems = problems.slice(0, -1);
                    // Preparing the pool connection to the DB
                    pool.connect(function (err, client, done) {
                        if (err) {
                            console.log("Not able to stablish connection: " + err);
                        } else {
                            // Execution of a query directly into the DB with parameters
                            client.query('SELECT * from prc_update_student_problems($1, $2, $3, $4)', [userID, studentsJudgeCodeChef[i]["studentId"], judgeName, problems], function (err, result) {
                                done();
                                if (err)
                                    console.log(err);
                            });
                        }
                    });

                } catch (err) {
                    console.log(err);
                    let error = "There was an error during the API query: " + err;
                    // Preparing the pool connection to the DB
                    pool.connect(function (err, client, done) {
                        if (err) {
                            console.log("Not able to stablish connection: " + err);
                        } else {
                            // Execution of a query directly into the DB with parameters
                            client.query('SELECT * from prc_add_student_log($1, $2, $3, $4)', [userID, studentsJudgeCodeChef[i]["studentId"], studentsJudgeCodeChef[i]["studentUsername"], error], function (err, result) {
                                done();
                                if (err)
                                    console.log(err);
                            });
                        }
                    });
                }

                var count = i + 1;
                if (count > 1 && count % 30 == 0) {
                    console.log("delay");
                    await sleep(300000);
                }
            } else {
                continue;
            }
        }
    } catch (err) {
        console.log("Couldn't get user token for CodeChef");
    }

}


//  Internal function to make the calls to the UVA API and retrieve the problems solved for each student 
//      with the user id and the students information as parameters

async function uvaAPICall(userID, studentsJudgeUVA) {
    var judgeName = "UVA";
    for (let i = 0; i < studentsJudgeUVA.length; i++) {
        if (studentsJudgeUVA[i]["studentUserID"] != "") {
            const url = process.env.UVA_GET_USERS + studentsJudgeUVA[i]["studentUserID"];

            try {
                const response = await axios.get(url);
                var studentProblems = response.data["subs"].filter(item => item[2] == 90);
                var problems = "";
                for (let j = 0; j < studentProblems.length; j++) {
                    problems += studentProblems[j][1] + ";";
                }

                problems = problems.slice(0, -1);

                // Preparing the pool connection to the DB
                pool.connect(function (err, client, done) {
                    if (err) {
                        console.log("Not able to stablish connection: " + err);
                    } else {
                        // Execution of a query directly into the DB with parameters
                        client.query('SELECT * from prc_update_student_problems($1, $2, $3, $4)', [userID, studentsJudgeUVA[i]["studentId"], judgeName, problems], function (err, result) {
                            done();
                            if (err)
                                console.log(err);
                        });
                    }
                });

            } catch (err) {
                console.log(err);
                let error = "There was an error during the API query: " + err;
                // Preparing the pool connection to the DB
                pool.connect(function (err, client, done) {
                    if (err) {
                        console.log("Not able to stablish connection: " + err);
                    } else {
                        // Execution of a query directly into the DB with parameters
                        client.query('SELECT * from prc_add_student_log($1, $2, $3, $4)', [userID, studentsJudgeUVA[i]["studentId"], response.data["uname"], error], function (err, result) {
                            done();
                            if (err)
                                console.log(err);
                        });
                    }
                });
            }
        }else{
            continue;
        }
    }
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

// Error handling for http calls
process.on("unhandledRejection", err => {
    console.log("Unhandled rejection:", err.message);
});
