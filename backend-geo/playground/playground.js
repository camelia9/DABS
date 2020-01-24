const {spawn} = require('child_process');
const {chunksToLinesAsync, chomp, streamWrite, streamEnd} = require('@rauschma/stringio');

async function echoReadable(readable) {
    for await (const line of chunksToLinesAsync(readable)) { // (C)
        console.log('LINE: '+chomp(line))
    }
}

async function writeToWritable(writable, command) {
    await streamWrite(writable, command);
    await streamEnd(writable);
}

exports.handler = async function (event) {

    const queryData = event.data;

    if (queryData.db_name === 'MongoDB') {
        //--username alice --password --authenticationDatabase admin --host mongodb0.examples.com --port 28015
        const pipe = spawn('mongo', ['--host=ds211099.mlab.com', '--authenticationDatabase=heroku_2kjhf18j', '--port=11099', '--username=geo_playground', '--password=databaseplayground1234'], {stdio: ['pipe', 'pipe', process.stderr]});
        await writeToWritable(pipe.stdin, 'use heroku_2kjhf18j \n db.pets.find({});'); // (B)
        await echoReadable(pipe.stdout); // (B)
    }

    if(queryData.db_name === 'Redis'){
        //$redis-cli -h 127.0.0.1 -p 6379 -a 'thisizmy!PASS'
        const pipe = spawn('redis-cli', ['-u' , 'redis://h:pb2468a88386cfa5a84c278ba7037b749baf8b31fed32dceccdf2c90034087ca8@ec2-34-242-22-173.eu-west-1.compute.amazonaws.com:19319'], {stdio: ['pipe', 'pipe', process.stderr]});
        await writeToWritable(pipe.stdin, 'SET mykey "Hello" \n GET mykey'); // (B)
        await echoReadable(pipe.stdout); // (B)
    }

    if(queryData.db_name === 'PostgreSQL'){
        //psql -h <host> -p <port> -U <username> -W <password> <database>
        let env = Object.create( process.env );
        env.PGPASSWORD = '732735659f78497f19658d1f1b4729330b3d1f863128b9234471152a0a3de028';
        const pipe = spawn('psql', ['-h' , 'ec2-54-247-72-30.eu-west-1.compute.amazonaws.com', '-p', '5432', '-U', 'wrfbotajgfudzd', '-d', 'dfcs49po879qk0'], {env: env, stdio: ['pipe', 'pipe', process.stderr]});
        await writeToWritable(pipe.stdin, 'SELECT * FROM pg_catalog.pg_tables;'); // (B)
        await echoReadable(pipe.stdout);

    }
};
