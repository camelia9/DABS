/**
 * Created by georgiana
 */
const express = require('express');
const router = express.Router();
const {spawn} = require('child_process');
const {chunksToLinesAsync, chomp, streamWrite, streamEnd} = require('@rauschma/stringio');
const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-central-1', accessKeyId: 'mykey', secretAccessKey: 'mysecret'});
const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});


async function echoReadable(readable) {
    let resp = '';
    for await (const line of chunksToLinesAsync(readable)) { // (C)
        resp += chomp(line) + '\r\n';
    }
    return resp;
}

async function writeToWritable(writable, command) {
    await streamWrite(writable, command);
    await streamEnd(writable);
}

async function authorize(authorizationToken) {
    const res = await dynamo.getItem({
        TableName: "sessions",
        Key: {
            'session_token': {
                S: authorizationToken
            }
        }
    }).promise();

    if (!res || !Object.keys(res).length) {
        throw new Error("Unauthorized");
    }
}


module.exports = async () => {

    router.post('/redis', async (req, res) => {
        let resp = {};
        if (!req || !req.body || !req.body.command || !req.body.authorizationToken) {
            resp = {
                "message": "Invalid Parameters",
                "status": 1
            };
            res.status(400);
            return await res.json(resp);
        }

        try {
            await authorize(req.body.authorizationToken);
        } catch (e) {
            res.status(403);
            return await res.json({
                data: "User is not authorized to access this resource with an explicit deny"
            });
        }


        //$redis-cli -h 127.0.0.1 -p 6379 -a 'thisizmy!PASS'
        try {
            const pipe = spawn('redis-cli', ['-u', 'redis://h:pb2468a88386cfa5a84c278ba7037b749baf8b31fed32dceccdf2c90034087ca8@ec2-34-242-22-173.eu-west-1.compute.amazonaws.com:19319'], {stdio: ['pipe', 'pipe', process.stderr]});
            await writeToWritable(pipe.stdin, req.body.command); // (B)
            resp.data = await echoReadable(pipe.stdout);
        } catch (err) {
            resp.data = 'There was an error parsing the command result.';
            resp.status = 1;
            res.status(500);
            return await res.json(resp);
        }
        resp.status = 0;
        res.status(200);
        return await res.json(resp);

    });

    router.post('/mongo', async (req, res) => {

        if (!req || !req.body || !req.body.command || !req.body.authorizationToken) {
            resp = {
                "message": "Invalid Parameters",
                "status": 1
            };
            res.status(400);
            return await res.json(resp);
        }

        try {
            await authorize(req.body.authorizationToken);
        } catch (e) {
            res.status(403);
            return await res.json({
                data: "User is not authorized to access this resource with an explicit deny"
            });
        }
        let resp = {};
        //--username alice --password --authenticationDatabase admin --host mongodb0.examples.com --port 28015
        try {
            const pipe = spawn('mongo', ['--host=ds211099.mlab.com', '--authenticationDatabase=heroku_2kjhf18j', '--port=11099', '--username=geo_playground', '--password=databaseplayground1234'], {stdio: ['pipe', 'pipe', process.stderr]});
            await writeToWritable(pipe.stdin, 'use heroku_2kjhf18j \n ' + req.body.command);
            resp.data = await echoReadable(pipe.stdout);
        } catch (err) {
            resp.data = 'There was an error processing the command.';
            resp.status = 1;
            res.status(500);
            return await res.json(resp);
        }
        resp.status = 0;
        res.status(200);
        return await res.json(resp);
    });

    router.post('/psql', async (req, res) => {

        let resp = {};
        if (!req || !req.body || !req.body.command || !req.body.authorizationToken) {
            resp = {
                "message": "Invalid Parameters",
                "status": 1
            };
            res.status(400);
            return await res.json(resp);
        }

        try {
            await authorize(req.body.authorizationToken);
        } catch (e) {
            res.status(403);
            return await res.json({
                data: "User is not authorized to access this resource with an explicit deny"
            });
        }

        //psql -h <host> -p <port> -U <username> -W <password> <database>
        try {
            let env = Object.create(process.env);
            env.PGPASSWORD = '732735659f78497f19658d1f1b4729330b3d1f863128b9234471152a0a3de028';
            const pipe = spawn('psql', ['-h', 'ec2-54-247-72-30.eu-west-1.compute.amazonaws.com', '-p', '5432', '-U', 'wrfbotajgfudzd', '-d', 'dfcs49po879qk0'], {
                env: env,
                stdio: ['pipe', 'pipe', process.stderr]
            });
            await writeToWritable(pipe.stdin, req.body.command); // (B)
            resp.data = await echoReadable(pipe.stdout);
        } catch (err) {
            resp.data = 'There was an error processing the command.';
            resp.status = 1;
            res.status(500);
            return await res.json(resp);
        }
        resp.status = 0;
        res.status(200);
        return await res.json(resp);
    });
    return router;
};
