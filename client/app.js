let boardState = [['x','o','o'],
                  ['x','o','o'],
                  ['x','x','o']];
let users = [];
let playTurn = 1;
let winBool = false;
let tieBool = false;
let printBoard = "";
const subUsername = document.getElementById("subUsername");


subUsername.addEventListener("click", getUsername);
document.getElementById('boardState').innerHTML = printboardState(boardState);

//Display all users
socket.on("new user", userList => {
    users.push(userList);
    console.log(users);
});

function getUsername()
{
    let username = document.getElementById('username').value;
    document.getElementById('username').value = null;
    console.log("get user triggered");
    socket.emit("join server", username);
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




