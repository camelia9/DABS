const express = require('express');
const cors = require('cors');
const app = express();

const router = require('./router');

const bodyParser = require('body-parser');


async function startServer() {
    await app.listen(3000, () => {
        console.log('Server listening on port 3000');
    });
}

async function setupRoutes() {

    await app.use(cors());

    await app.use(bodyParser.json());
    await app.use(bodyParser.urlencoded({extended: true}));

    await app.use('/playground', await router());

}

async function initServer() {
    await setupRoutes();
    await startServer();
}

initServer().then(() => {
    console.log("Everything is set up");
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
