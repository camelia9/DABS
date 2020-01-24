const test = require('./authentication').handler;

// console.log(test({
//     path: '/login',
//     body: {
//         email: 'gigel@gmail.com',
//         password: 'unbreakable'
//     }
// }));

test({
    path: '/login',
    body: JSON.stringify({
        email: 'gigel@gmail.com',
        password: '1234'
    })
}).then((res)=>{
    console.log(res);
});
