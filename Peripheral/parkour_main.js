// Using the bleno module
var bleno = require('bleno');
var parkour_uuid = '980C2C3A-089F-46FE-9177-5DE28ADBCE06';

// THRESHOLDS
const ABRUPT_CHANGE_THRESHOLD = 50;
const AVAILABLE_THRESHOLD = 140;

var lastDistance = null;
var availableParking = false;

// Once bleno starts, begin advertising our BLE address
bleno.on('stateChange', function(state) {
    console.log('State change: ' + state);
    if (state === 'poweredOn') {
        bleno.startAdvertising('ParkOur Assistant Kit',[parkour_uuid]);
    } else {
        bleno.stopAdvertising();
    }
});
 
// Notify the console that we've accepted a connection
bleno.on('accept', function(clientAddress) {
    console.log("Accepted connection from address: " + clientAddress);
});
 
// Notify the console that we have disconnected from a client
bleno.on('disconnect', function(clientAddress) {
    console.log("Disconnected from address: " + clientAddress);
});
 
// When we begin advertising, create a new service and characteristic
bleno.on('advertisingStart', function(error) {
    if (error) {
        console.log("Advertising start error:" + error);
    } else {
        console.log("Advertising start success");
        bleno.setServices([
            
            // Define a new service
            new bleno.PrimaryService({
                uuid : parkour_uuid,
                characteristics : [
                    
                    // Define a new characteristic within that service
                    new bleno.Characteristic({
                        value : null,
                        uuid : 'ec0e',
                        properties : ['notify', 'read', 'write'],
                        
                        // If the client subscribes, we send out a message every 1 second
                        onSubscribe : function(maxValueSize, updateValueCallback) {
                            console.log("Device subscribed");
                            this.intervalId = setInterval(function() {
                                var distanceAssist = require("./distance.js");
                                var distanceInfo = distanceAssist.getDistanceInfo();
                                
                                var curDistance = distanceInfo["distance"];

                                if (lastDistance == null) {
                                    lastDistance = curDistance;
                                    return;
                                }
                                
                                if (availableParking == false && curDistance - lastDistance > ABRUPT_CHANGE_THRESHOLD && curDistance > AVAILABLE_THRESHOLD) {
                                    availableParking = true;
                                    distanceInfo["available"] = true;
                                    console.log(distanceInfo);
                                    updateValueCallback(new Buffer(JSON.stringify(distanceInfo)));
                                } else if (availableParking == true && lastDistance - curDistance > ABRUPT_CHANGE_THRESHOLD && curDistance < AVAILABLE_THRESHOLD) {
                                    availableParking = false;
                                    distanceInfo["available"] = false;
                                    console.log(distanceInfo);
                                    updateValueCallback(new Buffer(JSON.stringify(distanceInfo)));
                                }
                                lastDistance = curDistance;

                                // updateValueCallback(new Buffer(n));
                            }, 25);
                        },
                        
                        // If the client unsubscribes, we stop broadcasting the message
                        onUnsubscribe : function() {
                            console.log("Device unsubscribed");
                            clearInterval(this.intervalId);
                        },
                        
                        // Send a message back to the client with the characteristic's value
                        onReadRequest : function(offset, callback) {
                            console.log("Read request received");
                            callback(this.RESULT_SUCCESS, new Buffer("Echo: " + 
                                    (this.value ? this.value.toString("utf-8") : "")));
                        },
                        
                        // Accept a new value for the characterstic's value
                        onWriteRequest : function(data, offset, withoutResponse, callback) {
                            this.value = data;
                            console.log('Write request: value = ' + this.value.toString("utf-8"));
                            callback(this.RESULT_SUCCESS);
                        }
 
                    })
                    
                ]
            })
        ]);
    }
});
