
const app= require("express")();
const server= require("http").createServer(app);
const io= require("socket.io")(server);
const {Chess}= require("chess.js");
const { join } = require("path");



let players={};
let currentPlayer="w";
const chess= new Chess();

app.set("view engine","ejs");
app.use(require("express").static(join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.render("index",{title:"catc chess"});
});

io.on("connection",(socket)=>{
    console.log("connected");
    if(!players.white){
        players.white= socket.id;
        socket.emit("playerRole", "w");
    }else if(!players.black){
        players.black=socket.id;
        socket.emit("playerRole","b");
    }else{
        socket.emit("spectatorRole");
    }
    socket.on("disconnect",()=>{
        if(socket.id === players.white){
            delete players.white;
        }else if(socket.id === players.black){
            delete players.black;
        }
    });
    socket.on("move",(move)=>{
        try{
            if(chess.turn()=== 'w' && socket.id !== players.white) return;
            if(chess.turn()=== 'b' && socket.id !== players.black) return;
            const result= chess.move(move);
            if(result){
                currentPlayer=chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen());
            }else{
                console.log("invalid move", move);
                socket.emit("invalidMove", move);
    
            }
        }catch(err){
            console.log(err);
            socket.emit("invalid move :",move);


        }
    })
});


server.listen(3000,()=>{
    console.log("server is running on port : 3000")
});