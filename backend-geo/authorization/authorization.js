const AWS = require('aws-sdk');
AWS.config.update({region: `eu-central-1`});
const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = async (event) => {

    if(!event.authorizationToken){
        return {
            "principalId": "",
            "policyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "execute-api:Invoke",
                        "Effect": "Deny",
                        "Resource": "*"
                    }
                ]
            }
        }
    }

    try{
        const res = await dynamo.getItem({
            TableName: "sessions",
            Key: {
                'session_token': {
                    S: event.authorizationToken
                }
            }
        }).promise();

        if(!res || !Object.keys(res).length){
            return {
                "principalId": "",
                "policyDocument": {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Action": "execute-api:Invoke",
                            "Effect": "Deny",
                            "Resource": "*"
                        }
                    ]
                }
            }
        }

        return {
            "principalId": res.Item.user_id["S"],
            "policyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "execute-api:Invoke",
                        "Effect": "Allow",
                        "Resource": "*"
                    }
                ]
            }
        }
    }catch(err){
        return {
            "principalId": "",
            "policyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "execute-api:Invoke",
                        "Effect": "Deny",
                        "Resource": "*"
                    }
                ]
            }
        }
    }

};

