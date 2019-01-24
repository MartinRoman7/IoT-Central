'use strict';

// https://docs.microsoft.com/en-us/azure/iot-central/tutorial-define-device-type

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;
var ConnectionString = require('azure-iot-device').ConnectionString;

var connectionString = '';
var targetTemperature = 0;
var client = clientFromConnectionString(connectionString);

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

let date = require('date-and-time');

var data_rb = [];


function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                console.log("Read Text: "+allText);
                sendTelemetry(allText);
                //return allText;
            }
        }
    }
    rawFile.send(null);
}

function javascript_abort()
{
   throw new Error('This is not an error. This is just to abort javascript');
}

// Send device telemetry.
function sendTelemetry(data_file) {
    //var data_file = readTextFile("file:///home/martin/Documentos/file.txt");
    console.log("Send Telemetry: "+data_file);
    var clear_data = data_file.split(",");
    var state_puerta = clear_data[1];
    let now = new Date();
    var date_time = date.format(now, 'YYYY/MM/DD HH:mm:ss');
    //var temperature = targetTemperature + (Math.random() * 15);
    var data = JSON.stringify({ puerta_abierta_alerta : state_puerta });
    var message = new Message(data);
    client.sendEvent(message, (err, res) => console.log(`Sent message: ${message.getData()}` +
      (err ? `; error: ${err.toString()}` : '') +
      (res ? `; status: ${res.constructor.name}` : '') + 
      '; {"Date & time": "'+date_time+'"}'));
    
  }

// Send device properties
function sendDeviceProperties(twin) {
    var properties = {
      firmwareVersion: "9.75",
      serialNumber: "Raspberry-01",
      sensorNumber_01: "sensorTemp 01",
      sensorNumber_02: "sensorTemp 02"
    };
    twin.properties.reported.update(properties, (errorMessage) => 
      console.log(` * Sent device properties ` + (errorMessage ? `Error: ${errorMessage.toString()}` : `(success)`)));

    }
/*
// Add any settings your device supports
// mapped to a function that is called when the setting is changed.
var settings = {
    'setTemperature': (newValue, callback) => {
      // Simulate the temperature setting taking two steps.
      setTimeout(() => {
        targetTemperature = targetTemperature + (newValue - targetTemperature) / 2;
        callback(targetTemperature, 'pending');
        setTimeout(() => {
          targetTemperature = newValue;
          callback(targetTemperature, 'completed');
        }, 5000);
      }, 5000);
    }
  };

// Handle settings changes that come from Azure IoT Central via the device twin.
function handleSettings(twin) {
    twin.on('properties.desired', function (desiredChange) {
      for (let setting in desiredChange) {
        if (settings[setting]) {
          console.log(`Received setting: ${setting}: ${desiredChange[setting].value}`);
          settings[setting](desiredChange[setting].value, (newValue, status, message) => {
            var patch = {
              [setting]: {
                value: newValue,
                status: status,
                desiredVersion: desiredChange.$version,
                message: message
              }
            }
            twin.properties.reported.update(patch, (err) => console.log(`Sent setting update for ${setting}; ` +
              (err ? `error: ${err.toString()}` : `status: success`)));
          });
        }
      }
    });
  }*/

// Respond to the echo command
function onCommandEcho(request, response) {
    // Display console info
    console.log(' * Echo command received');
    // Respond
    response.send(10, 'Success', function (errorMessage) {});
  }

  // Handle device connection to Azure IoT Central.
  var connectCallback = (err) => {
    if (err) {
      console.log(`Device could not connect to Azure IoT Central: ${err.toString()}`);
    } else {
      console.log('Device successfully connected to Azure IoT Central');
      // Send telemetry measurements to Azure IoT Central every 1 second.
      //setInterval(sendTelemetry, 30000);
      readTextFile("file:///home/pi/Desktop/cadena-frio/data-IoT/puerta_alerta");
      // Setup device command callbacks
      client.onDeviceMethod('echo', onCommandEcho);
      // Get device twin from Azure IoT Central.
      client.getTwin((err, twin) => {
        if (err) {
          console.log(`Error getting device twin: ${err.toString()}`);
        } else {
          // Send device properties once on device start up
          sendDeviceProperties(twin);
          // Apply device settings and handle changes to device settings.
          //handleSettings(twin);
        }
      });
    }
  };
  

  process.argv.forEach(function (value, index ){
    data_rb[index] = value;
    console.log(index + ': ' + value);
  });

  console.log(data_rb);

  client.open(connectCallback);
