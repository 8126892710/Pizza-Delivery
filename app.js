const express = require('express');
const app = express();
const userRoute = require('./server/user/route/server.user.route');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/db')


/**-----Database connect----------*/
mongoose.connect(`mongodb://${config.db}/pizzaDelivery`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
mongoose.set('useCreateIndex', true);
// mongoose.set('useFindAndModify', false);

app.use(bodyParser.json({ limit: '100mb' }))

/**-------CONNECTION EVENTS-------*/
// When successfully connected
mongoose.connection.on('connected', () => {
    console.log('success', 'Mongoose default connection open to ' + `${config.db}`);
});
// If the connection throws an error
mongoose.connection.on('error', (err) => {
    console.log('error', 'Mongoose default connection error: ' + err);
});
// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('warning', 'Mongoose default connection disconnected');
});
// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('warning', 'Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

/**-----------Routes------------------ */
const apiPrefix = '/api/v1';

app.use(apiPrefix + '/user', userRoute)
/**----------------------------------- */
app.listen(config.port, () => {
    console.log(`Server is running : ${config.port}`);
})

  // console.log(`Worker ${process.pid} started`);
//}

