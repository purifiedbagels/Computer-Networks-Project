
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

document.getElementById("pickRoomHeader").style.display = "none";
document.getElementById("roomState").style.display = "none";
document.getElementById("roomSelector").style.display = "none";
document.getElementById("playSquare").style.display = "none";
document.getElementById("playerWon").style.display = "none";
document.getElementById("boardState").style.display = "none";
const subUsername = document.getElementById("subUsername");
const subRoom = document.getElementById("subRoom");
subUsername.addEventListener("click", getUsername);
subRoom.addEventListener("click", roomSelect);
tds.forEach((td)=>{td.addEventListener("click", takeTurn);})


socketRef.on("new user", userList => {
    if(JSON.stringify(user) === JSON.stringify([]))
    {
        user.push(userList);
        console.log(user);
        socket.emit("initial room update", rooms);
    }
});
socketRef.on("initial update rooms", roomList => {
    rooms = [];
    rooms.push(roomList);
    console.log(rooms);
    printRoomState();
});
socket.on("update rooms", roomList => {
    rooms = [];
    rooms.push(roomList);
    console.log(rooms);
    printRoomState();
    printboardState(rooms[0][currentBoard].board);
});
socket.on("room joined", (roomNum) =>{
    printboardState(rooms[0][roomNum].board);
    document.getElementById("boardState").style.display = "block";
    currentBoard = roomNum;
    printRoomState();
});
socketRef.on("update room state", roomList => {
    for(let i = 0; i < 4; i++)
    {
        rooms[0][i].numUsers = roomList[i].numUsers;
    }
    printRoomState();
});
socket.on("player won", (playerWon) =>{
    if(JSON.stringify(playerWon).includes(JSON.stringify(user)))
    {
        document.getElementById("playerWon").innerHTML = "You won!";

    }
    else
    {
        document.getElementById("playerWon").innerHTML = "You lose!";
    }
    document.getElementById("playerWon").style.display = "block";
});

function getUsername()
{
    let username = document.getElementById('username').value;
    console.log("get user triggered");
    socket.emit("join server", username);
    document.getElementById("username").style.display = "none";
    document.getElementById("usernameLabel").style.display = "none";
    document.getElementById("subUsername").style.display = "none";
    document.getElementById("pickRoomHeader").style.display = "block";
    document.getElementById("roomState").style.display = "block";
    document.getElementById("roomSelector").style.display = "block";
    document.getElementById('username').value = null;
}

function roomSelect()
{
    let roomNum = document.getElementById('room').value;
    let roomID = "room"+document.getElementById('room').value;
    let user_exists = false;
    console.log("Room Selected: " + JSON.stringify(roomNum));
    console.log("Static user is: " + JSON.stringify(user));
    console.log("rooms is: " + rooms);
    console.log("Value of rooms[0][roomNum].users: " + JSON.stringify(rooms[0][roomNum].users));
    console.log("Value of JSON.stringify(rooms[0][roomNum].users).includes(JSON.stringify(user)): " + JSON.stringify(rooms[0][roomNum].users).includes(JSON.stringify(user)));
    if(JSON.stringify(rooms[0][roomNum].users).includes(JSON.stringify(user)))
    {
        user_exists = true;
        rooms[0][roomNum].users.push(null);
        console.log("This user is already in the room");
    }
    console.log("Output for saying room is full: " + rooms[0][roomNum].numUsers == 2 && user_exists == false)
    if(rooms[0][roomNum].numUsers == 2 && user_exists == false)
    {
        document.getElementById('roomFull').innerHTML = "Room is full, select another";
        document.getElementById('roomFull').style.display = "block";
    }
    else if(rooms[0][roomNum].numUsers != 2)
    {
        document.getElementById('roomFull').style.display = "none";
        if(user_exists == false)
        {
            rooms[0][roomNum].numUsers = rooms[0][roomNum].numUsers + 1;
            rooms[0][roomNum].users.push(user);
            console.log("users in client side room now is: " + JSON.stringify(rooms[0][roomNum].users));
        }
        console.log("Sending join room to server with: " + JSON.stringify(rooms[0][roomNum]));
        socket.emit("join room", rooms[0][roomNum]);
        rooms[0][roomNum].users.pop(null);
        document.getElementById("playSquare").style.display = "block";
    }
}

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
            console.log(sqID);
            document.getElementById(sqID).innerHTML = a[i][n];
            sqCnt++;
        }
    }
}

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

function takeTurn()
{
    let tempID = this.id;
    let tempRow = 0;
    let tempCol = 0;
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
    console.log("The user selected square: " + JSON.stringify(selectedSquare));
    socket.emit("play square", selectedSquare);
    console.log(tempID);
}