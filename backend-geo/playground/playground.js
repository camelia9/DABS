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
};
