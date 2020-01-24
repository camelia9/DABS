const AWS = require('aws-sdk');
const crypto = require('crypto');
AWS.config.update({
    region: 'eu-central-1',
    accessKeyId: 'mykey',
    secretAccessKey: 'mysecret'
});
const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
const uuid = require('uuid');

async function handleLogout(event) {
    if (!event.queryStringParameters || !event.queryStringParameters.user_token) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                "status": 1,
                "message": "Missing Parameters"
            }),
            headers: {
                "Access-Control-Allow-Origin" : "*"
            }
        };
    }

    try {
        await dynamo.deleteItem({
            TableName: "sessions",
            Key: {
                'session_token': {
                    S: event.queryStringParameters.user_token
                }
            }
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                "status": 0,
                "message": "ok"
            }),
            headers: {
                "Access-Control-Allow-Origin" : "*"
            }
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                "status": 0,
                "message": "Session still active. Please retry."
            }),
            headers: {
                "Access-Control-Allow-Origin" : "*"
            }
        }
    }
}

async function handleLogin(event) {
    event.body = JSON.parse(event.body);
    if (!event.body || !event.body.email || !event.body.password) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                "status": 1,
                "message": "Missing Parameters"
            }),
            headers: {
                "Access-Control-Allow-Origin" : "*"
            }
        };
    }

    const params = {
        FunctionName: 'users_test', // the lambda function we are going to invoke
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
            'email': event.body.email
        })
    };

    let resp;
    let user_id;
    try {
        resp = await lambda.invoke(params).promise();
        if (!resp.hasOwnProperty('Payload')) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    "message": "Error retrieving user data"
                }),
                headers: {
                    "Access-Control-Allow-Origin" : "*"
                }
            };
        }
        let userData = JSON.parse(resp.Payload);
        const hash = crypto.createHash('sha256');
        hash.update(event.body.password);
        const passhash = hash.digest('hex');
        if (passhash !== userData.body.password) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    "message": "Wrong user or password"
                }),
                headers: {
                    "Access-Control-Allow-Origin" : "*"
                }
            };
        }
        user_id = userData.body.user_id;
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                "message": "Error retrieving user data"
            }),
            headers: {
                "Access-Control-Allow-Origin" : "*"
            }
        };
    }

    let res;
    try {
        res = await dynamo.scan({
            TableName: "sessions",
            ExpressionAttributeValues: {
                ":usr": {
                    S: user_id
                }
            },
            FilterExpression: "user_id = :usr"
        }).promise();

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                "status": 0,
                "message": "Failed finding active session"
            }),
            headers: {
                "Access-Control-Allow-Origin" : "*"
            }
        }
    }

    if (res && res.Items && Array.isArray(res.Items) && res.Items.length) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                "status": 0,
                "message": "ok",
                "user_token": res.Items[0].session_token.S,
                "user_id": user_id
            }),
            headers: {
                "Access-Control-Allow-Origin" : "*"
            }
        }
    }

    const user_token = uuid.v4();

    try {
        await dynamo.putItem({
            TableName: "sessions",
            Item: {
                "session_token": {
                    S: user_token
                },
                "user_id": {
                    S: user_id
                },
                "timestamp": {
                    N: Math.floor(Date.now() / 1000).toString()
                }
            }
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                "status": 0,
                "message": "ok",
                "user_token": user_token,
                "user_id": user_id
            }),
            headers: {
                "Access-Control-Allow-Origin" : "*"
            }
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                "status": 0,
                "message": "Session still active. Please retry."
            }),
            headers: {
                "Access-Control-Allow-Origin" : "*"
            }
        }
    }


}


exports.handler = async (event) => {

    if (event.path === '/login') {
        return await handleLogin(event);
    }

    if (event.path === '/logout') {
        return await handleLogout(event);
    }

    return {
        statusCode: 501,
        body: JSON.stringify({
            "message": "Not Implemented"
        }),
        headers: {
            "Access-Control-Allow-Origin" : "*"
        }
    };


};

