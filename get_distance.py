import RPi.GPIO as GPIO
import time

def get_distance():
    GPIO.setmode(GPIO.BCM)
    TRIG = 23
    ECHO = 24

    GPIO.setup(TRIG, GPIO.OUT)
    GPIO.setup(ECHO, GPIO.IN)

    GPIO.output(TRIG, True)
    time.sleep(0.0001)
    GPIO.output(TRIG, False)

    while GPIO.input(ECHO) == False:
        start = time.time()

    while GPIO.input(ECHO) == True:
        end = time.time()

    sig_time = end - start
    distance = sig_time / 0.000058
    # print(sig_time / 0.000058)
    return distance

if __name__ == '__main__':
    print(get_distance())
    
