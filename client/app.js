// Instantiate variables and join server
let boardState = [['','',''],
                ['','',''],
                ['','','']];
let user = [];
let rooms = [];
let playTurn = 1;
let winBool = false;
let tieBool = false;
let socketRef = io.connect("/");
let currentBoard = -1;
let tds = document.querySelectorAll("td");

// Hide elements that appear based on client state
document.getElementById("pickRoomHeader").style.display = "none";
document.getElementById("roomState").style.display = "none";
document.getElementById("roomSelector").style.display = "none";
document.getElementById("playSquare").style.display = "none";
document.getElementById("yourTurn").style.display = "none";
document.getElementById("playerWon").style.display = "none";
document.getElementById("subNewGame").style.display = "none";
document.getElementById("leaveRoom").style.display = "none";
document.getElementById("boardState").style.display = "none";
// Setup all submission buttons
const subUsername = document.getElementById("subUsername");
const subRoom = document.getElementById("subRoom");
const subNewGame = document.getElementById("subNewGame");
const subleaveRoom = document.getElementById("leaveRoom")
subUsername.addEventListener("click", getUsername);
subRoom.addEventListener("click", roomSelect);
subNewGame.addEventListener("click", newGame);
subleaveRoom.addEventListener("click", leaveRoom);
tds.forEach((td)=>{td.addEventListener("click", takeTurn);})

// Caches the client's user object and calls to do initial update rooms
socketRef.on("new user", userList => {
    if(JSON.stringify(user) === JSON.stringify([]))
    {
        user.push(userList);
        console.log("User: " + user);
        socket.emit("initial room update", rooms);
    }
});
// Updates rooms and only prints room states
socketRef.on("initial update rooms", roomList => {
    rooms = [];
    rooms.push(roomList);
    printRoomState();
});
// Updates rooms and displays proper elements
socket.on("update rooms", roomList => {
    rooms = [];
    rooms.push(roomList);
    console.log("Updating rooms: " + JSON.stringify(rooms));
    printRoomState();
    printboardState(rooms[0][currentBoard].board);
    if(JSON.stringify(rooms[0][currentBoard].lastPlayed) == JSON.stringify([[]]))
    {
        document.getElementById("yourTurn").innerHTML = "Waiting for another player to join!"
    }
    else if(JSON.stringify(rooms[0][currentBoard].lastPlayed).includes(JSON.stringify(user)))
    {
        document.getElementById("yourTurn").innerHTML = "Waiting on opponent's turn!"
    }
    else
    {
        document.getElementById("yourTurn").innerHTML = "Your turn to play!"
    }
    if(rooms[0][currentBoard].won == false)
    {
        document.getElementById("playerWon").style.display = "none";
        document.getElementById("yourTurn").style.display = "block";
    }
    else
    {
        document.getElementById("playerWon").style.display = "block";
        document.getElementById("yourTurn").style.display = "none";
    }
});
// Handles switching rooms and updates elements
socket.on("room joined", (roomNum) =>{
    printboardState(rooms[0][roomNum].board);
    document.getElementById("boardState").style.display = "block";
    document.getElementById("subNewGame").style.display = "block";
    document.getElementById("leaveRoom").style.display = "block";
    currentBoard = roomNum;
    printRoomState();
});
// Unique update for clients that are not in the room that was joined
socketRef.on("update room state", roomList => {
    for(let i = 0; i < 4; i++)
    {
        rooms[0][i].numUsers = roomList[i].numUsers;
    }
    printRoomState();
});
// Event for displaying win state
socket.on("player won", (playerWon) =>{
    if(JSON.stringify(playerWon).includes(JSON.stringify(user)))
    {
        document.getElementById("playerWon").innerHTML = "You won!";

    }
    else
    {
        document.getElementById("playerWon").innerHTML = "You lose!";
    }
});

// Function for submission of a username and joining server
function getUsername()
{
    let username = document.getElementById('username').value;
    socket.emit("join server", username);
    document.getElementById("username").style.display = "none";
    document.getElementById("usernameLabel").style.display = "none";
    document.getElementById("subUsername").style.display = "none";
    document.getElementById("pickRoomHeader").style.display = "block";
    document.getElementById("roomState").style.display = "block";
    document.getElementById("roomSelector").style.display = "block";
    document.getElementById('username').value = null;
}

// Function for submission of a room selection
function roomSelect()
{
    let roomNum = document.getElementById('room').value;
    let roomID = "room"+document.getElementById('room').value;
    let user_exists = false;
    console.log("Static user: " + JSON.stringify(user));
    console.log("Room users: " + JSON.stringify(rooms[0][roomNum].users));
    // Checks if the user is already in the room
    if(JSON.stringify(rooms[0][roomNum].users).includes(JSON.stringify(user)))
    {
        user_exists = true;
        rooms[0][roomNum].users.push(null);
    }
    // Checks if room is full
    if(rooms[0][roomNum].numUsers == 2 && user_exists == false)
    {
        document.getElementById('roomFull').innerHTML = "Room is full, select another";
        document.getElementById('roomFull').style.display = "block";
    }
    // Joins the room if room is not full
    else
    {
        document.getElementById('roomFull').style.display = "none";
        // Push user is the user is not in the room yet
        if(user_exists == false)
        {
            rooms[0][roomNum].numUsers = rooms[0][roomNum].numUsers + 1;
            rooms[0][roomNum].users.push(user);
        }
        console.log("Joining Room: " + JSON.stringify(rooms[0][roomNum]));
        socket.emit("join room", rooms[0][roomNum]);
        rooms[0][roomNum].users.pop(null);
        document.getElementById("playSquare").style.display = "block";
    }
}

// Function for submission of a new game
function newGame()
{
    socket.emit("new game", currentBoard);
}

// Function for submission of leaving a room
function leaveRoom()
{
    socket.emit("leave room", [currentBoard, user]);
    currentBoard = -1;
    document.getElementById("playSquare").style.display = "none";
    document.getElementById("playerWon").style.display = "none";
    document.getElementById("yourTurn").style.display = "none";
    document.getElementById("boardState").style.display = "none";
    document.getElementById("subNewGame").style.display = "none";
    document.getElementById("leaveRoom").style.display = "none";
}

// Function to print the board state 
function printboardState(a)
{
    let sqID = "";
    let sqCnt = 0;
    for(let i = 0; i < 3; i++)
    {
        for(let n = 0; n < 3; n++)
        {
            sqID = "";
            sqID = "sq" + sqCnt;
            document.getElementById(sqID).innerHTML = a[i][n];
            sqCnt++;
        }
    }
}

// Function to print the room states
function printRoomState()
{
    let roomState = "";
    let tempParse = "";
    for(let i = 0; i < 4; i++)
    {
        tempParse = "Room Number: ";
        tempParse = tempParse + rooms[0][i].id;
        tempParse = tempParse + "  ";
        tempParse = tempParse + "Room Population: ";
        tempParse = tempParse + rooms[0][i].numUsers;
        roomState = roomState + ' | ' + tempParse;
    }
document.getElementById('roomState').innerHTML = roomState;
}

// Function for a client taking a turn
function takeTurn()
{
    let tempID = this.id;
    let tempRow = 0;
    let tempCol = 0;
    // switch statement to convert table square to rows and columns
    switch (tempID)
    {
        case 'sq0' :
            tempRow = 0;
            tempCol = 0;
            break;
        case 'sq1' :
            tempRow = 0;
            tempCol = 1;
            break;
        case 'sq2' :
            tempRow = 0;
            tempCol = 2;
            break;
        case 'sq3' :
            tempRow = 1;
            tempCol = 0;
            break;
        case 'sq4' :
            tempRow = 1;
            tempCol = 1;
            break; 
        case 'sq5' :
            tempRow = 1;
            tempCol = 2;
            break;
        case 'sq6' :
            tempRow = 2;
            tempCol = 0;
            break;
        case 'sq7' :
            tempRow = 2;
            tempCol = 1;
            break;
        case 'sq8' :
            tempRow = 2;
            tempCol = 2;
            break;
    }
    let selectedSquare = [parseInt(tempRow), parseInt(tempCol), currentBoard, user];
    if(JSON.stringify(rooms[0][currentBoard].lastPlayed) == JSON.stringify([[]])){}
    else
    {
        console.log("The user selected square: " + JSON.stringify(selectedSquare));
        socket.emit("play square", selectedSquare);
    }
    
}