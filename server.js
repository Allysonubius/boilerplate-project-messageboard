'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');
const database = require('./database/db-connection.js');
const { errorHandler, notFoundHandler } = require("./middlewares");
const { default: mongoose } = require('mongoose');
const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' })); //For FCC testing purposes only
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/b/:board/').get(function(req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
});

app.route('/b/:board/:threadid').get(function(req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
});

//Index page (static HTML)
app.route('/').get(function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT, function() {
    database(process.env.MONGO_URI).then(async(MONGO_URI) => {
        console.log('\n', 1, ' = CONECTADO', '\n', 2, ' = CONECTANDO', '\n', 3, ' = DESCONECTANDO', '\n', 0, ' = DESCONECTADO', '\n\n', 'STATUS DE CONEXÂO COM O BANCO DE DADOS :', mongoose.connection.readyState);
        console.log('\n', `Your app is listening on port http://localhost/${listener.address().port}`);
        // For FCC testing purposes
        fccTestingRoutes(app);
        // Routing for API 
        apiRoutes(app);
        // Error Handler Middleware
        app.use(errorHandler);
        // 404 Not Found Middleware
        app.use(notFoundHandler);
        if (process.env.NODE_ENV) {
            console.log('\n Running Tests...');
            setTimeout(function() {
                try {
                    runner.run();
                } catch (e) {
                    console.log('\n', 'Tests are not valid:');
                    console.error(e);
                }
            }, 1500);
        }
    }).catch((err) => {
        console.error(err);
    });
});

module.exports = app; //for testing