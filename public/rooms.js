let rooms = [
    {
        id: 1,
        numUsers: 0 
    },
    {
        id: 2,
        numUsers: 0 
    },
    {
        id: 3,
        numUsers: 0 
    },
    {
        id: 4,
        numUsers: 0 
    },
];

let roomState = "";
let tempParse = "";

for(let i = 0; i < 4; i++)
{
    tempParse = JSON.stringify(rooms[i])
    tempParse = tempParse.replace(/"/g, "");
    tempParse = tempParse.replace('{', "");
    tempParse = tempParse.replace('}', "");
    roomState = roomState + " | " + tempParse;
}
document.getElementById('roomState').innerHTML = roomState;

