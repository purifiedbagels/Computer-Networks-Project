let rooms = [
    {
        id: 1,
        numUsers: 0, 
        board: [['x','o','o'],
                ['x','o','o'],
                ['x','x','o']]
    },
    {
        id: 2,
        numUsers: 0, 
        board: [['x','o','o'],
                ['x','o','o'],
                ['x','x','o']] 
    },
    {
        id: 3,
        numUsers: 0, 
        board: [['x','o','o'],
                ['x','o','o'],
                ['x','x','o']] 
    },
    {
        id: 4,
        numUsers: 0, 
        board: [['x','o','o'],
                ['x','o','o'],
                ['x','x','o']] 
    }
];

let roomState = "";
let tempParse = "";

for(let i = 0; i < 4; i++)
{
    tempParse = "Room Number: ";
    tempParse = tempParse + JSON.stringify(rooms[i].id);
    tempParse = tempParse + "  ";
    tempParse = tempParse + "Room Population: ";
    tempParse = tempParse + JSON.stringify(rooms[i].numUsers);
    roomState = roomState + ' | ' + tempParse;
}
document.getElementById('roomState').innerHTML = roomState;

