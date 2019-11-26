const Gpio = require('pigpio').Gpio;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECONDS_PER_CM = 1e6/34321;
const SAMPLING_FREQ = 100; // 100 times per second
const QUEUE_LENGTH = 5;
const MAX_RANGE = 1500.0;
const MIN_RANGE = 10.0;

const trigger = new Gpio(23, {mode: Gpio.OUTPUT});
const echo = new Gpio(24, {mode: Gpio.INPUT, alert: true});

// var distance = 0.0;
var distanceQueue = new Array();

trigger.digitalWrite(0); // Make sure trigger is low

const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const watchHCSR04 = () => {
    let startTick;
    echo.on('alert', (level, tick) => {
        if (level == 1) {
            startTick = tick;
        } else {
            const endTick = tick;
            const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
            const distance = diff / 2 / MICROSECONDS_PER_CM;
            
            // simply ignore the result if the value is weird
            if (distance > MAX_RANGE || distance < MIN_RANGE)
                return;

            distanceQueue.push(distance);
            //console.log("-------------------------------------");
            while (distanceQueue.length > 5)
                distanceQueue.shift();
            //console.log(median(distanceQueue));
            //console.log(distanceQueue);
            //console.log("-------------------------------------");
        }
    });
};

watchHCSR04();

exports.getDistance = function () {
    //console.log("distanceQueue:", distanceQueue)
    return median(distanceQueue);
}

exports.getDistanceInfo = function(){
    var distanceInfo = {"timestamp": Date.now(), "distance": median(distanceQueue)};
    return distanceInfo;
}

// Trigger a distance measurement 10 times per second
setInterval(() => {
    trigger.trigger(70, 1); // Set trigger high for 10 microseconds
}, 1000 / SAMPLING_FREQ);

