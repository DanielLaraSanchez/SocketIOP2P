module.exports = class Moderator {
    constructor() { }

    objectModifier(arrayOfObjects, identifier, property, callback, returnObjectBool) {
        let returnedObject = null;
        arrayOfObjects.forEach((object) => {
            if(object[`${property}`] === identifier)
            callback(object)
            returnedObject = object;
        }); 

        if(returnObjectBool){
            return returnedObject
        }

    }

   

    objectModifierWithReturn(arrayOfObjects, identifier, property, callback) {
        let returnedObject;
        arrayOfObjects.forEach((object) => {
            if(object[`${property}`] === identifier)
            callback(object)
        });
    }

    setConexionSender(connection, sender) {
        if (connection.sender === null) {
            connection.sender = sender;
        }
    }

    setConexionReciever(connection, reciever) {
        if (connection.reciever === null) {
            connection.reiever = reciever;
        }
    }




    findConnectionWaiting() {//when you return an object from an array do you actually return that very object or a copy of it?


    }






}