
const socket= io();
const chess= new Chess();
const boardElement= document.querySelector(".chessboard");
let draggedPiece= null;
let sourceSquare=null;
let playerRole=null;

const renderBoard=()=>{
    const board= chess.board();
    boardElement.innerHTML="";
    board.forEach((row,rowIndex)=>{
        row.forEach((square,squareIndex)=>{

            // for board
            const squareElement= document.createElement("div");
            squareElement.classList.add("square", (rowIndex + squareIndex)%2 === 0 ? "light":"dark");

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col= squareIndex;

            // for pieces
            if(square){
                const pieceElement= document.createElement("div");
                pieceElement.classList.add("piece",square.color === 'w' ? "white":"black");
                pieceElement.innerText=getPieceUnicode(square);
                pieceElement.draggable=playerRole === square.color;


                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable){
                        draggedPiece= pieceElement;
                        sourceSquare= {row:rowIndex, col:squareIndex};
                        e.dataTransfer.setData("text/plain","");  // important for drag
                    }
                });
                pieceElement.addEventListener("dragend",(e)=>{
                    draggedPiece=null;
                    sourceSquare=null;
                });
                squareElement.appendChild(pieceElement);

            }

            squareElement.addEventListener("dragover",function (e){
                e.preventDefault();

            });
            squareElement.addEventListener("drop", function (e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource={
                        row:parseInt( squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col)
                    };

                    handleMove(sourceSquare,targetSource);
                }
            });
            boardElement.appendChild(squareElement);

        });
    });

    if(playerRole === 'b'){
        boardElement.classList.add("flipped");
    }else{
        boardElement.classList.remove("flipped");
    }


};

const handleMove=(source,target)=>{
    const move={
        from: `${String.fromCharCode(97+source.col)}${8- source.row}` ,
        to: `${String.fromCharCode(97+target.col)}${8- target.row}` ,
        promotion: 'q'
    };
    if (chess.move(move)) {
        socket.emit("move", move);

        let count=0;
        const recordMove = document.querySelector(".moves");
        const moveElement=document.createElement("div");
        moveElement.classList.add("moveElement");
        moveElement.innerHTML=` ${move.from} to ${move.to}`;
        moveElement.style.display = "flex";
        moveElement.style.flexDirection = "column";
        moveElement.style.border = "2px solid grey";
        moveElement.style.alignItems = "center";
        moveElement.style.justifyContent = "center";



        recordMove.appendChild(moveElement);

        
        
    }

};
const getPieceUnicode=(piece)=>{
    const unicodePieces= {
        p:"♙",
        n:"♞",
        b:"♝",
        r:"♜",
        q:"♛",
        k:"♚",
        P:"♟",
        N:"♘",
        B:"♗",
        R:"♖",
        Q:"♕",
        K:"♔"

    };
    return unicodePieces[piece.type] || "";

};

socket.on("playerRole",function(role){
    playerRole=role;
    renderBoard();
});
socket.on("spectatorRole", function(){
    renderBoard();
});
socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard();
});
socket.on("move", (fen)=>{
    chess.move(fen);
    renderBoard();
});
renderBoard();