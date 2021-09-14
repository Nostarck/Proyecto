import routes from './index.js';

const route = (app) => {
    //Route for requests related to user data
    app.use('/user', routes.user);

    //Route for requests related to students data
    app.use('/student', routes.student);

    //Route for requests related to groups data
    app.use('/group', routes.group);

    //Route for requests related to tags data
    app.use('/tag', routes.tag);

    //Route for requests related to problems data
    app.use('/problem', routes.problem);

    //Routes for basic requests
    
    app.get('/', (req, res) => {
        return res.send('Received a GET HTTP method');
    });
        
    app.post('/', (req, res) => {
        return res.send('Received a POST HTTP method');
    });
    
    app.put('/', (req, res) => {
        return res.send('Received a PUT HTTP method');
    });
    
    app.delete('/', (req, res) => {
        return res.send('Received a DELETE HTTP method');
    });
}

export default route;