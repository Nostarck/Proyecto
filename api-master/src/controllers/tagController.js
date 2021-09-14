import pg from 'pg';

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


// Function to create a tag
// Will recieve in the body:
//                            the tag name

export const addTag = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_add_tag($1, $2)', [userID, req.body.tagName], function (err, result) {
            done();
            if (err) {
                console.log(err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
            // Parsing to JSON the result
            var tag;
            for (var i = 0; i < result.rows.length; i++) {
                tag = result.rows[i];
            }
            // Return the result from the DB with OK (200) status
            res.status(200).send(tag);
        });
    });
}


// Function to delete a tag
// Will recieve in the body:
//                            the unique tag id

export const deleteTag = (req, res) => {
    // Preparing the pool connection to the DB
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_delete_tags($1, $2)', [userID, req.body.uniqueTagID], function (err, result) {
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


// Function to update a tag name
// Will recieve in the body:
//                            the unique tag id
//                            the new tag name

export const updateTag = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_update_tag($1, $2, $3)', [userID, req.params.uniqueTagID, req.body.tagName], function (err, result) {
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


// Function to get all the tags associated to a user

export const getTagsInfo = (req, res) => {
    var userID = req.user._id;
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_get_tags($1)', [userID], function (err, result) {
            done();
            if (err) {
                console.log(err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
            // Return with OK (200) status
            res.status(200).send(result.rows);
        });
    });
}


// Function to get all the tag name used by the filter based on the user id

export const getTagsNames = (req, res) => {
    req.setTimeout(1000);
    var userID = req.user._id;
    // Execution of a query directly into the DB with parameters
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        // Execution of a query directly into the DB with parameters
        client.query('SELECT * from prc_get_tags_names($1)', [userID], function (err, result) {
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