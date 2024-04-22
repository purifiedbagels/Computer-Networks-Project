
let boardState = [['','',''],
                ['','',''],
                ['','','']];
let user = [];
let rooms = [];
let playTurn = 1;
let winBool = false;
let tieBool = false;
let socketRef = io.connect("/");


document.getElementById("pickRoomHeader").style.display = "none";
document.getElementById("roomState").style.display = "none";
document.getElementById("roomSelector").style.display = "none";
const subUsername = document.getElementById("subUsername");
const subRoom = document.getElementById("subRoom");
subUsername.addEventListener("click", getUsername);
subRoom.addEventListener("click", roomSelect);
//document.getElementById('boardState').innerHTML = printboardState(boardState);

//Display all users
socketRef.on("new user", userList => {
    user.push(userList);
    console.log(user);
    socket.emit("initial room update", rooms);
});
socketRef.on("update rooms", roomList => {
    rooms = [];
    rooms.push(roomList);
    console.log(rooms);
    printRoomState();
});
socketRef.on("room joined", (roomNum) =>{
    document.getElementById('boardState').innerHTML = printboardState(rooms[0][roomNum].board);
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
    if(rooms[0][roomNum].numUsers == 2)
    {
        document.getElementById('roomFull').innerHTML = "Room is full, select another";
        document.getElementById('roomFull').style.display = "block";
    }
    else
    {
        document.getElementById('roomFull').style.display = "none";
        let user_exists = false;
        for (let i = 0; i < rooms[0][roomNum].users.length; i++)
        {
            console.log("Static user is: " + JSON.stringify(user));
            console.log("Value of rooms[0][roomNum].users: " + JSON.stringify(rooms[0][roomNum].users));
            console.log("Value of JSON.stringify(rooms[0][roomNum].users).includes(JSON.stringify(user)): " + JSON.stringify(rooms[0][roomNum].users).includes(JSON.stringify(user)));
            if(JSON.stringify(rooms[0][roomNum].users).includes(JSON.stringify(user)))
            {
                user_exists = true;
                rooms[0][roomNum].users.push(null);
                console.log("This user is already in the room");
                break;
            }
        }
        if(user_exists == false)
        {
            rooms[0][roomNum].numUsers = rooms[0][roomNum].numUsers + 1;
            rooms[0][roomNum].users.push(user);
            console.log("users in client side room now is: " + JSON.stringify(rooms[0][roomNum].users));
        }
        socket.emit("join room", rooms[0][roomNum]);
        rooms[0][roomNum].users.pop(null);
    }
}

function printboardState(a)
{
    let printBoard = ""
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
