const http = require('http');
const express = require('express');
// var mysql = require('mysql');
var axios = require('axios');
const cors = require("cors");
const socketIO = require("socket.io");
const { urlencoded } = require('express');
const app = express();
const port = process.env.port || 4500;





app.use(cors());
app.get('/', (req, res) => {
    res.send('Welcome to socket port of Odisoft Crm');
})

let users = [];
last_user_keyword = {};
const server = http.createServer(app)

const io = socketIO(server);



io.on('connection', (socket) => {
    console.log('New Connection')
    socket.on('user_connected', (user) => {
        var sender_name = user.sender_name
        var sender_id = user.sender_id
        var receiver_id = user.user.user_id
        var receiver_name = user.user.first_name
        if (sender_name in last_user_keyword) {
            console.log('hi');
            val = last_user_keyword[sender_name]
            console.log(val, 'val')
            delete users[val]
            delete last_user_keyword[sender_name]
            users[sender_name+receiver_name] = socket.id
            last_user_keyword[sender_name] = sender_name+receiver_name
            socket.join(sender_name+receiver_name)
            console.log(users)
            get_chats({ sender_id: sender_id, receiver_id: user.user.user_id, type: 'personal', token: user.token })
        } else {
            users[sender_name+receiver_name] = socket.id
            last_user_keyword[sender_name] = sender_name+receiver_name
            socket.join(sender_name+receiver_name)
            console.log(users)
            get_chats({ sender_id: sender_id, receiver_id: user.user.user_id, type: 'personal', token: user.token })


        }

    })
    socket.on('sendMessage', (data) => {
        console.log(data, 'datas1')
        token = data.token;
        receiver_id = data.receiver_id;
        receiver_name = data.receiver_name;
        sender_name = data.sender_name;
        if(receiver_name+sender_name in users){
            let socketid = users[receiver_name+sender_name];
            console.log('yes socket is available',socketid)
            console.log(typeof(socketid));
            io.emit('sendMessages',data.message,data.receiver_id);
             axios.post('https://crmapi.odisoft.in/office_app/add_chat?company_code=OC_Z2CpoOMpmrRSeTfk', data, {
            headers: {
                Authorization: token,
            },
        }).then(
            (response) => {
            },
            (error) => {
                console.log(error, 'error');
            }
        );

        }else{
            // console.log(users);
            // console.log(receiver_name+sender_name);
            console.log('no socket available');
            axios.post('https://crmapi.odisoft.in/office_app/add_chat?company_code=OC_Z2CpoOMpmrRSeTfk', data, {
            headers: {
                Authorization: token,
            },
        }).then(
            (response) => {
                // console.log(response,'saved chat')
            },
            (error) => {
                console.log(error, 'error');
            }
        );
        }

        
    })


    socket.on('disconnect', function () {

        socket.emit('disconnected');
        // online = online - 1;
        console.log(users, 'disconnected', socket.id)
    });


    function get_chats(data) {
        token = data.token
        console.log(data)
        axios.post('https://crmapi.odisoft.in/office_app/get_chat?company_code=OC_Z2CpoOMpmrRSeTfk', data, {
            headers: {
                Authorization: token,
            },
        }).then(
            (response) => {
                chat = {}
                console.log(response.data.Chats);
                chats = response.data.Chats;
                // console.log(chats,'chats')
                io.emit('lo_chats', ({ chats: chats }));
            },
            (error) => {
                // console.log(error, 'error');
                io.emit('no_chats')
            }
        );

    }




})

server.listen(port, () => {
    console.log(`Listenning to port ${port}`)
})