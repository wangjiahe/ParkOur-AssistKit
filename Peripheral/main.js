var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;

var EchoCharacteristic = require('./characteristic');

console.log('bleno - echo');

var parkour_uuid = '980C2C3A-089F-46FE-9177-5DE28ADBCE06'

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('ParkOur Assistant Kit', [parkour_uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
	//uuid: 'ec00',
        uuid: parkour_uuid,
        characteristics: [
          new EchoCharacteristic()
        ]
      })
    ]);
  }
});
