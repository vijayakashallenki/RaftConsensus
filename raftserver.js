const express = require('express');
const app1 = express();
const app2 = express();
const app3 = express();
const app4 = express();
const app5 = express();

let replicatedlog = [2, 2, 2, 2, 2];
const servers = [
    { id: 1, app: app1, port: 3011, isOnline: false, votes:0},
    { id: 2, app: app2, port: 3012, isOnline: true, votes: 0 },
    { id: 3, app: app3, port: 3013, isOnline: true, votes: 0 },
    { id: 4, app: app4, port: 3014, isOnline: true, votes: 0 },
    { id: 5, app: app5, port: 3015, isOnline: true, votes: 0 },
];
let CL = servers[0];
if(!CL.isOnline){
    CL = startElection();
}
CL.app.get('/',(req,res)=>{
    res.sendFile('/index.html',{root:__dirname});
});
servers.forEach((server) => {
    if (server !== CL) {
      server.app.get('/', (req, res) => {
        res.send('<h2>This route is not a leader for manipulating the log</h2>');
      });
    }
  });
CL.app.get('/add/:index1/:index2/:index3',(req,res) => {
  const { index1, index2, index3 } = req.params;
  const result = replicatedlog[index1] + replicatedlog[index2];
  replicatedlog[index3] = result;
  res.send(replicatedlog);
});
CL.app.get('/mul/:index1/:index2/:index3', (req, res) => {
  const { index1, index2, index3 } = req.params;
  const result = replicatedlog[index1]*replicatedlog[index2];
  replicatedlog[index3] = result;
  res.send(replicatedlog);
});
app1.get('/getdata', (req, res) => {
  res.send(replicatedlog);
});
app2.get('/getdata', (req, res) => {
    res.send(replicatedlog);
});
app3.get('/getdata', (req, res) => {
    res.send(replicatedlog);
});
app4.get('/getdata', (req, res) => {
    res.send(replicatedlog);
});
app5.get('/getdata', (req, res) => {
    res.send(replicatedlog);
});
function startElection() {
    servers.forEach((server) => {
      server.votes = 0;
    });
    servers.forEach((cs) => {
      servers.forEach((os) => {
        if(cs.isOnline==true && os.isOnline==true){
        if (cs !== os) {
          voteForServer(os);
        }
    }
      });
    });
    const leader = servers.reduce((maxvotesserver, currentserver) => {
        return currentserver.votes > maxvotesserver.votes ? currentserver : maxvotesserver;
      });
    console.log("election happened the present leader is "+leader.id);
    return leader;
  }
  function voteForServer(server) {
    const random = Math.floor(Math.random() * 2);
    if (random === 1) {
      server.votes++;
    }
  }

servers.forEach((server) => {
  server.app.listen(server.port, () => {
    console.log(`${server.id} started on ${server.port}`);
  });
});
