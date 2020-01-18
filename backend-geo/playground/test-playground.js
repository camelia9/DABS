const {handler} = require('./playground');


handler({
    data: {
        db_name: "MongoDB",
        command: "blabla"
    }
}).then((res) => {

});
