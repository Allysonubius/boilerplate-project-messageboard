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
        const acess_port = `Your app is listening on port http://localhost/${listener.address().port}`;
        switch (mongoose.connection.readyState) {

            case 1:
                console.log('\n', 'MONGODB CONECTADO', '\n\n', acess_port);
                break;
            case 2:
                console.log('\n', 'MONGODB CONECTANDO', '\n\n', acess_port);
                break;
            case 3:
                console.log('\n', 'MONGODB DESCONECTANDO', '\n\n', acess_port);
                break;
            case 4:
                console.log('\n', 'MONGODB DESCONECTADO', '\n\n', acess_port);
                break;
            default:
                console.log('\n', 'MONGODB FORA DO AR', '\n\n', acess_port)
        }
        // For FCC testing purposes
        fccTestingRoutes(app);
        // Routing for API 
        apiRoutes(app);

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