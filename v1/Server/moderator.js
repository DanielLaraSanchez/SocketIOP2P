class Moderator {

    constructor() {
    }

    checkIfClientIsAlreadyInConnection(connArray, peerId) {
        let isAllocated = false;
        let connection = connArray.filter((conn) => {
            return conn.sender === peerId || conn.reciever === peerId;
        });
        if (connection.length === 0) {
            return isAllocated;
        } else {
            isAllocated = connection[0].connectionId;
            return isAllocated;
        }
    }

    getConnectionWaiting(connArray) {
        let result;
        connArray.forEach((conn) => {
            if (conn.reciever === null && conn.sender != null) {
                result = conn.id;
            } else if (conn.sender === null && conn.reciever != null) {
                result = conn.id;
            } else {
                result = false;
            }
        });
        return result;
    }

    insertPeerInConnection(connArray, connId, peerid) {
       
        connArray.forEach((conn) => {
            console.log(conn, "conn")
            if (conn.id === connId && conn.reciever === null && conn.sender != peerid) {
                console.log("46")
                conn.reciever = peerid;
            } else if (conn.id === connId && conn.sender === null && conn.reciever != peerid) {
                console.log("49")
                conn.sender = peerid;
            }else{
                console.log("no funciona 50", conn.id,connId, conn.reciever, conn.sender)
            }
        })
        
    }

    setIsReadyOnPeer(peerArray, peerId) {
        peerArray.forEach((peer) => {
            if (peer.socketid === peerId) {
                peer.isReady = true;
            }
        });
    }

    setNicknameOnPeer(peerArray, peerId, nickname) {
        peerArray.forEach((peer) => {
            if (peer.socketid === peerId) {
                peer.nickname = nickname;
            }
        })
    }






    deletePeerOnDisconnection(array, peerToBeDeletedId) {
        array.forEach((peer, index) => {
            if (peer.socketid === peerToBeDeletedId) {
                array.splice(index, 1);
            }
        })
    }

    deletePeerFromConnection(connArray, socketid) {
        connArray.forEach((conn, index) => {
            if (conn.reciever === socketid) {
                conn.reciever = null;
            } else if (conn.sender === socketid) {
                conn.sender = null;
            }
        })
    }

    deleteConnectionWhenEmpty(connArray) {
        connArray.forEach((conn, index) => {
            if (conn.sender === null && conn.reciever === null) {
                connArray.splice(index, 1);
            }
        })
    }

    setConexionSender(connectionArray, senderId) {
        connectionArray.forEach((connection) => {
            if (connection.sender === null) {
                connection.sender = senderId;
            }
        });
    }

    setConexionReciever(connectionArray, recieverId) {
        connectionArray.forEach((connection) => {
            if (connection.reciever === null) {
                connection.reiever = recieverId;
            }
        });
    }


}



module.exports = Moderator;