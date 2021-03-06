# COHOMA HMI

This project is a [Node.js](https://nodejs.org/en/) application first designed for CoHoMa challenge, a robotic competition organized by french military forces to show potential of a colaboration between both human and robot in a context of a defusing operation.
It can be configured to be ran on a pc with a socket connection to manage Husky Rover (https://github.com/julesberhault/husky.git) and Anafi Drone through ROS via [rosbridge_server/websocket](http://wiki.ros.org/rosbridge_suite).

## Installation

The dependencies are [Node.js](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/fr).
You can check [this website](https://nodejs.org/en/download/) to install Node.js and [this one](https://docs.mongodb.com/guides/server/install/) to install MongoDB.

After having cloned this repository, in order to install all of the Node.js packages required, you should run
```sh
npm install
```


## Configuration

All of the settings are in the `.env` file. 
Every one of them should be checked after installation.

## Usage

Start the program :

```sh
node app.js
```

The portal should appear on the pc address, port 8000.
(if it doesn't, go check (0.0.0.0:8000) on your browser)
