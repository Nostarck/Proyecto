import pg from 'pg';
import json2csv from 'json2csv';

// Object created in memory to set the Pool connection with PostgresSQL DB
const config = {
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    max: process.env.DATABASE_MAX_CONNECTIONS,
    idleTimeoutMillis: process.env.DATABASE_TIME,
};

var pool = new pg.Pool(config);


// Function to create a group
// Will recieve in the body:
//                            the group name

export const addGroup = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_add_group($1, $2)', [userID, req.body.groupName], function (err, result) {
            done();
            if (err) {
                console.log(err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
            var group;
            for (var i = 0; i < result.rows.length; i++) {
                group = result.rows[i];
            }
            // Return the result from the DB with OK (200) status
            res.status(200).send(group);
        });
    });
}


// Function to delete a group
// Will recieve in the body:
//                            the unique group id

export const deleteGroup = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_delete_group($1, $2)', [userID, req.params.uniqueGroupID], function (err, result) {
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


// Function to update a group
// Will recieve in the body:
//                            the unique group id
//                            the new group name

export const updateGroup = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_update_group($1, $2, $3)', [userID, req.params.uniqueGroupID, req.body.groupName], function (err, result) {
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


// Function to get all the groups with the students information
// Will recieve in the body:
//                            the unique tag ids

export const getGroupsInfo = async (req, res) => {
    req.setTimeout(1000);
    var userID = req.user._id;

    // Preparing the pool connection to the DB
    const client =  await pool.connect();
    
    try{
        // Execution of a queries directly into the DB with parameters
        const groupsInfoResult = await client.query('SELECT * from prc_get_groups($1, $2)', [userID, req.body.tags]).catch(err => {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
          });
        const groupsStudentsResult = await client.query('SELECT * from prc_get_groups_students($1, $2)', [userID, req.body.tags]).catch(err => {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
        });

        var groupsInfo = groupsInfoResult.rows;
        var groupsStudents = groupsStudentsResult.rows;

        var groupsStudentsFlatten = [];
        for (let i = 0; i < groupsStudents.length; i++){
            groupsStudentsFlatten.push(flattenObject(groupsStudents[i]));
        }

        for(var i = 0; i < groupsInfo.length; i++) {
            groupsInfo[i]["isExpanded"] = false;
            groupsInfo[i]["students"] = groupsStudentsFlatten.filter(item => item.groupid == groupsInfo[i]["id"]);
        }

        // Return the result from the DB with OK (200) status
        client.end();
        res.status(200).send(groupsInfo);

    } finally{
        client.release()
    }
}


// Function to retrieve the groups names for the filter

export const getGroupsForFilter = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_get_groups($1, $2)', [userID, ""], function (err, result) {
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


// Function to export a group information into a CSV file
// Will recieve in the body:
//                            the unique group id

export const exportGroup = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_get_group_students($1, $2)', [userID, req.params.uniqueGroupID], function(err, result) {
          done(); 
          if(err){
            console.log(err);
                // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
          }
          var group = [];
          for (let i = 0; i < result.rows.length; i++){
                group.push(flattenObject(result.rows[i]));
          }

          const csv = json2csv.parse(group);
          res.attachment(req.body.groupName + '.csv');
        // Return the result from the DB with OK (200) status
          res.status(200).send(csv);
        });
    });
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