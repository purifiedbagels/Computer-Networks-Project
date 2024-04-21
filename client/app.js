let boardState = [['x','o','o'],
                  ['x','o','o'],
                  ['x','x','o']];
let users = [];
let playTurn = 1;
let winBool = false;
let tieBool = false;
let printBoard = "";


document.getElementById("pickRoomHeader").style.display = "none";
document.getElementById("roomState").style.display = "none";
document.getElementById("roomSelector").style.display = "none";
const subUsername = document.getElementById("subUsername");
const subRoom = document.getElementById("subRoom");
subUsername.addEventListener("click", getUsername);
subRoom.addEventListener("click", roomSelect);
//document.getElementById('boardState').innerHTML = printboardState(boardState);

//Display all users
socket.on("new user", userList => {
    users.push(userList);
    console.log(users);
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
    console.log("Room Selected: " + JSON.stringify(roomNum));
    if(rooms[roomNum] == 2)
    {
        document.getElementById('roomFull').innerHTML = "Room is full, select another";
    }
    else
    {
        rooms[roomNum].numUsers = rooms[roomNum].numUsers + 1;
        socket.emit("join room", rooms[roomNum].id, rooms[roomNum].numUsers, rooms[roomNum].board);
        document.getElementById('boardState').innerHTML = printboardState(rooms[roomNum].board);
    }
}

function printboardState(a)
{
    for(let i = 0; i < 3; i++)
    {
        for(let n = 0; n < 3; n++)
        {
            printBoard = printBoard + "|" + a[i][n] + "|";
        }
        printBoard = printBoard + "<br>";
    }
    return printBoard;
}




