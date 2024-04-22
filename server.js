const express = require('express');
const http = require("http");
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors:{
        origin: "https://localhost:8080",
        methods: ["GET", "POST"]
    }
});


let users = [];
let rooms = [
    {
        id: 0,
        numUsers: 0,
        users: [],
        board: [['','',''],
                ['','',''],
                ['','','']] 
    },
    {
        id: 1,
        numUsers: 0,
        users: [], 
        board: [['','',''],
                ['','',''],
                ['','','']] 
    },
    {
        id: 2,
        numUsers: 0,
        users: [], 
        board: [['','',''],
                ['','',''],
                ['','','']] 
    },
    {
        id: 3,
        numUsers: 0,
        users: [], 
        board: [['','',''],
                ['','',''],
                ['','','']] 
    }
];


//connection event 
io.on('connection', socket => {
    socket.on("join server", (username) => {
        const user = {
            username,
            id: socket.id,
        };
        users.push(user);
        console.log(user);
        io.emit("new user", user);
    });
    socket.on("initial room update", (room) => {
        io.emit("update rooms", rooms);
    });
    socket.on("join room", (roomList) => {
        //socket.join(roomList.id);
        console.log(roomList.numUsers);
        rooms[roomList.id].numUsers = roomList.numUsers;
        rooms[roomList.id].board = roomList.board;
        console.log("Room users before updating: " + JSON.stringify(rooms[roomList.id].users));
        if(roomList.users.includes(null) == false)
            rooms[roomList.id].users.push(roomList.users[0]);
        console.log("Room users after updating: " + JSON.stringify(rooms[roomList.id].users));
        console.log("The users on the server side are: " + JSON.stringify(users));
        io.emit("update rooms", rooms)
        io.emit("room joined", roomList.id);
    });
});



//Middleware for serving static files. Points express server to the correct folder for pulling files
app.use(express.static(path.join(__dirname)));


//Request html file to fetch from directory http request to pull static file
app.get('/', async(req, res) => {                                   
    res.sendFile(path.join(__dirname, 'public', 'apphtml.html'));
});


//Confirmation we're on port 8080 
server.listen(8080, () => {
    console.log("Server successfully running on part 8080");
});
