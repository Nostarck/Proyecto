import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

// Function to verify if the user has logged in

export const loginRequired = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        return res.status(401).json({ message: "Unauthorized user!" });
    }
}

// Function to register a new user
// Will recieve in the body:
//                            the username
//                            the email address
//                            the user password

export const register = (req, res) => {
    // Preparing the pool connection to the DB
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("Not able to stablish connection: " + err);
            // Return the error with BAD REQUEST (400) status
            res.status(400).send(err);
        }
        var hashPassword = bcrypt.hashSync(req.body.password, 10);
        client.query('SELECT * from prc_register_user($1, $2, $3)', [req.body.username, req.body.email, hashPassword], function (err, result) {
            done();
            if (err) {
                console.log(err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send({ message: err });
            } else {
                var user = result.rows[0];
                console.log(user);
                // Return the result from the DB with OK (200) status
                return res.json(user);
            }
        });
    });
}

// Function to login an existing user
// Will recieve in the body:
//                            the username
//                            the user password

export const login = (req, res) => {

    var username = req.body.username;

    findUserByUsername(username);

    // Internal function to search the user in the DB

    function findUserByUsername(username) {
        pool.connect(function (err, client, done) {
            if (err) {
                console.log("Not able to stablish connection: " + err);
                // Return the error with BAD REQUEST (400) status
                res.status(400).send(err);
            }
            client.query('SELECT * from prc_find_user_by_username($1)', [username], function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    // Return the error with BAD REQUEST (400) status
                    res.status(400).send(err);
                }

                if (result.rows.length == 0) {
                    // Return the error with UNAUTHORIZED (401) status
                    res.status(401).json({ message: 'Authentication failed. No user found' });
                } else {

                    var user;
                    user = result.rows[0];
                    console.log(user);
                    if (!comparePassword(req.body.password, user.hash)) {
                        // Return the error with UNAUTHORIZED (401) status
                        res.status(401).json({ message: 'Authentication failed. Wrong password' });
                    } else {


                    const currentDate = new Date();
                    currentDate.setHours( currentDate.getHours() + 7 );
                        // Return the JWT token with OK (200) status
                        return res.json({ token: jwt.sign({ username: user.username, 
                                                            _id: user.id,
                                                            exp: Math.floor(currentDate / 1000)}, process.env.SECRET_KEY) });
                    }

                }
            });
        });
    }

    // Internal function to compare the provided hash password with the hash password from the DB

    function comparePassword(password, hashPassword) {
        return bcrypt.compareSync(password, hashPassword);
    }
}