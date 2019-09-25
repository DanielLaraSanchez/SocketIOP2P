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

    getConnectionWaitingAndInsertPeer(connArray, peerId) {
        let result;
        connArray.forEach((conn) => {
            if (conn.reciever === null && conn.sender != null) {
                conn.reciever = peerId;
                result = true;
                console.log("insideFirst if")
            } else if (conn.sender === null && conn.reciever != null) {
                conn.sender = peerId;
                result = true;
                console.log("inside second if")

            } else {
                result = false;
                console.log("inside else")

            }
        });
        console.log(result, "result")
        return result;
    }

    insertPeerInConnection(connArray, connId, peerid) {
        connArray.forEach((conn) => {
            if (conn.id === connId && conn.reciever === null) {
                conn.reciever = peerid;
            } else if (conn.id === connId && conn.sender === null) {
                conn.sender = peerid
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