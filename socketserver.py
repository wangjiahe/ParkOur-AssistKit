#!/usr/bin/python3           # This is server.py file
import socket                                         
from get_distance import get_distance

# create a socket object
serversocket = socket.socket(
	        socket.AF_INET, socket.SOCK_STREAM) 

# get local machine name
host = socket.gethostname()                           

port = 9999                                           
print(host, ":", port)
# bind to the port
serversocket.bind((host, port))                                  

# queue up to 5 requests
serversocket.listen(5)                                           

while True:
   # establish a connection
   clientsocket,addr = serversocket.accept()      

   print("Got a connection from %s" % str(addr))
    
   msg = str(get_distance()) + "\r\n"
   clientsocket.send(msg.encode('ascii'))
   clientsocket.close()
