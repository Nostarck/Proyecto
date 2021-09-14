import 'dotenv/config.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken'; 
import routes from './src/routes/apiRoute.js';
import pg from 'pg';

const app = express();

app.use(cors());

//Body parser library to handle request content
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT validation in case token was sent in the request
app.use((req, res, next) => {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
      jsonwebtoken.verify(req.headers.authorization.split(' ')[1], process.env.SECRET_KEY, (err, decode) => {
          if (err) req.user = undefined;
          req.user = decode;
          next();
      });
  } else {
      req.user = undefined;
      next();
  }
});

// Set date as string to avoid PG to convert the column data into JS date objects with timestamp
var types = pg.types;
    types.setTypeParser(1082, function(stringValue) {
    return stringValue;
});

// Route mapping
routes(app);

//App server initialize 
app.listen(process.env.PORT, () =>
  console.log(`App listening on port ${process.env.PORT}!`),
);