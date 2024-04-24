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
        won: false,
        board: [['','',''],
                ['','',''],
                ['','','']] 
    },
    {
        id: 1,
        numUsers: 0,
        users: [],
        won: false, 
        board: [['','',''],
                ['','',''],
                ['','','']] 
    },
    {
        id: 2,
        numUsers: 0,
        users: [],
        won: false, 
        board: [['','',''],
                ['','',''],
                ['','','']]  
    },
    {
        id: 3,
        numUsers: 0,
        users: [],
        won: false, 
        board: [['','',''],
                ['','',''],
                ['','','']]  
    }
];
let lastPlayed = [[]];


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
        io.emit("initial update rooms", rooms);
    });
    socket.on("join room", (roomList) => {
        let roomID = "room"+roomList.id;
        socket.join(roomID);
        console.log(socket.rooms);
        console.log(roomList.numUsers);
        rooms[roomList.id].numUsers = roomList.numUsers;
        rooms[roomList.id].board = roomList.board;
        console.log("Room users before updating: " + JSON.stringify(rooms[roomList.id].users));
        if(roomList.users.includes(null) == false)
            console.log("Detected null in client side room users");
            console.log("pushing last element of client side room user to serverside room users: " + JSON.stringify(roomList.users[roomList.users.length - 1]));
            rooms[roomList.id].users.push(roomList.users[roomList.users.length - 1]);
        console.log("Room users after updating: " + JSON.stringify(rooms[roomList.id].users));
        console.log("The users on the server side are: " + JSON.stringify(users));
        io.to(roomID).emit("room joined", roomList.id);
        io.to(roomID).emit("update rooms", rooms);
        io.emit("update room state", rooms);
    });
    socket.on("play square", (square) => {
        let roomID = "room"+square[2];
        console.log(roomID);
        if(rooms[square[2]].won){}
        else
        {
            if(JSON.stringify(lastPlayed).includes(JSON.stringify(square[3])) == false && rooms[square[2]].board[square[0]][square[1]] == '')
            {
                if(JSON.stringify(rooms[square[2]].users[0]) === JSON.stringify(square[3]))
                {
                    rooms[square[2]].board[square[0]][square[1]] = "x";
                }
                else
                {
                    rooms[square[2]].board[square[0]][square[1]] = "o";
                }
            lastPlayed = [square[3]];
            io.to(roomID).emit("update rooms", rooms);
            let win = checkWin(rooms[square[2]].board);
            console.log("Win is: " + win);
            if(win)
            {
                rooms[square[2]].won = true;
                io.to(roomID).emit("player won", lastPlayed);
            }
            }
        }
    });
});

function checkWin(board)
{
    let win = false;
    for(let i = 0; i < board.length; i++)
    {
        //Check Horizontally
        if(board[i][0] == '' || board[i][1] == '' || board[i][2] == '')
        {
            continue;
        }
        if(board[i][0] == board[i][1] && board[i][0] == board[i][2])
        {
            win = true;
        }
    }
    for(let i = 0; i < board.length; i++)
    {
        //Check Vertically
        if(board[0][i] == '' || board[1][i] == '' || board[2][i] == '')
        {
            continue;
        }
        if(board[0][i] == board[1][i] && board[0][i] == board[2][i])
        {
            win = true;
        }
    }
    //Check diagonally
    if(board[0][0] == board[1][1] && board[0][0] == board[2][2])
    {
        if(board[0][0] == '' || board[1][1] == '' || board[2][2] == ''){}
        else
        {
            win = true;
        }
    }
    if(board[0][2] == board[1][1] && board[0][2] == board[2][0])
    {
        if(board[0][2] == '' || board[1][1] == '' || board[2][0] == ''){}
        else
        {
        win = true;
        }
    }
    return win;
    
}

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
