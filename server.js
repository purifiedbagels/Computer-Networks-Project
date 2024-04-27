// Instantiate variables and create the server
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
                ['','','']],
        lastPlayed: [[]] 
    },
    {
        id: 1,
        numUsers: 0,
        users: [],
        won: false, 
        board: [['','',''],
                ['','',''],
                ['','','']],
        lastPlayed: [[]] 
    },
    {
        id: 2,
        numUsers: 0,
        users: [],
        won: false, 
        board: [['','',''],
                ['','',''],
                ['','','']],
        lastPlayed: [[]]  
    },
    {
        id: 3,
        numUsers: 0,
        users: [],
        won: false, 
        board: [['','',''],
                ['','',''],
                ['','','']],
        lastPlayed: [[]]  
    }
];


//connection event 
io.on('connection', socket => {
    // Creates a user when a client joins server
    socket.on("join server", (username) => {
        const user = {
            username,
            id: socket.id,
        };
        users.push(user);
        console.log("The users on the server side are: " + JSON.stringify(users));
        io.emit("new user", user);
    });
    // Updates the client rooms when user is initially created
    socket.on("initial room update", (room) => {
        io.emit("initial update rooms", rooms);
    });
    // Adds the client socket to the room specified and updates room
    socket.on("join room", (roomList) => {
        let roomID = "room"+roomList.id;
        socket.join(roomID);
        console.log(socket.rooms);
        rooms[roomList.id].numUsers = roomList.numUsers;
        rooms[roomList.id].board = roomList.board;
        console.log("Room users before updating: " + JSON.stringify(rooms[roomList.id].users));
        // Checks if the user is already in the room(indicated by null) and pushes user if not
        if(roomList.users.includes(null) == false)
        {
            rooms[roomList.id].users.push(roomList.users[roomList.users.length - 1]);
        }
        console.log("Room users after updating: " + JSON.stringify(rooms[roomList.id].users));
        // Keeps lastPlayed null until 2 users join room, allowing for play
        if(rooms[roomList.id].users.length == 2 && JSON.stringify(rooms[roomList.id].lastPlayed) == JSON.stringify([[]]))
        {
            rooms[roomList.id].lastPlayed = rooms[roomList.id].users[1]
        }
        io.to(roomID).emit("room joined", roomList.id);
        io.to(roomID).emit("update rooms", rooms);
        io.emit("update room state", rooms);
    });
    // Updates the game state when a client plays a square
    socket.on("play square", (square) => {
        let roomID = "room"+square[2];
        // Does not allow play if the game is already won
        if(rooms[square[2]].won){}
        else
        {
            // Only allow next player to play and determine x/o
            if(JSON.stringify(rooms[square[2]].lastPlayed).includes(JSON.stringify(square[3])) == false && rooms[square[2]].board[square[0]][square[1]] == '')
            {
                if(JSON.stringify(rooms[square[2]].users[0]) === JSON.stringify(square[3]))
                {
                    rooms[square[2]].board[square[0]][square[1]] = "x";
                }
                else
                {
                    rooms[square[2]].board[square[0]][square[1]] = "o";
                }
            rooms[square[2]].lastPlayed = [square[3]];
            // Check the win state and update values if player won
            let win = checkWin(rooms[square[2]].board);
            if(win)
            {
                rooms[square[2]].won = true;
                io.to(roomID).emit("player won", rooms[square[2]].lastPlayed);
            }
            io.to(roomID).emit("update rooms", rooms);
            }
        }
    });
    // Allows for players to create a clean, new game
    socket.on("new game", (roomID) => {
        newGame(roomID);
        io.to("room" + roomID).emit("update rooms", rooms);
    });
    // Allows for players to disconnect their socket from a room
    socket.on("leave room", (userLeave) => {
        // Removes user and clears game state
        newGame(userLeave[0]);
        rooms[userLeave[0]].lastPlayed = [[]];
        rooms[userLeave[0]].users.splice(rooms[userLeave[0]].users.indexOf(userLeave[1]));
        if(rooms[userLeave[0]].numUsers > 0)
        {
            rooms[userLeave[0]].numUsers = rooms[userLeave[0]].numUsers - 1
        }
        socket.leave("room" + userLeave[0]);
        io.emit("initial update rooms", rooms);
        io.to("room" + userLeave[0]).emit("update rooms", rooms);
    });
});

// Function that checks win conditions of the board
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

// Function to clear the board and won value of a room
function newGame(roomID)
{
    rooms[roomID].won = false;
    rooms[roomID].board = [['','',''],['','',''],['','','']];
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
