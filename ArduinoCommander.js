var sp = require("serialport");

module.exports = ArduinoCommander;

function ArduinoCommander()
{
	this.baudrate = 9600;
	this.comPort = null;
	this._serialPort = null;
	this._expectedManufacturer = "wch.cn";
}

ArduinoCommander.prototype.findComPort = function (callback) {
    var scope = this;

	var connect = function() {
		if (!scope.comPort) {
			console.log(
				"FindCOMPort:Unable to find arduino connected with manufacturer: "
				+ scope._expectedManufacturer);
			return;
		}

		console.log("Starting serial communications with port: " + scope.comPort);

		scope._serialPort = new sp.SerialPort(scope.comPort,
			{
				baudrate: scope.baudrate
			});
		console.log("Started serial communications with port: " + scope.comPort);
		callback();
	}

	sp.list(function (err, ports) {
		ports.forEach(function (port) {
			{
				if (port.manufacturer.indexOf(scope._expectedManufacturer) > -1) {
					scope.comPort = port.comName;
					console.log("Found COM port: " + scope.comPort);
				}
			}
		});
		connect();
	});
};

ArduinoCommander.prototype.init = function() {
	var scope = this;

	if(!this.comPort) {
	    this.findComPort(function(){
	        if(!scope.comPort) {
	            console.log("INIT: Could not init arduino commander. No COM port found");
	            return;
	        }

	        scope._serialPort.on("open", function(error){
	            if(error)
	            {
	                console.log("Failed to open COM port:" + scope.comPort);
	            }
	            console.log("open");
	            scope._serialPort.on("data", scope.processData);
	        });
	    });
	}
};

ArduinoCommander.prototype.sendCommand = function (command, callback) {
    if (!command) {
        console.log("Null command argument");
        return;
    }
    var scope = this;
    console.log("Sending command: " + command.id + " with value: " + command.value);
    this.parseCommand(command, function (str) {
        scope._serialPort.write(str, callback);
    });
};

ArduinoCommander.prototype.parseCommand = function(command, callback) {
    if (!command || !callback){
        console.log("Could not parse command. Invalid command or callback");
        return;
    }

    var commandSeparator = ';';
    var parameterSeparator = '|';
        
    var str = command.id + parameterSeparator + command.value + commandSeparator;

    console.log("Parsed command. Output: " + str);

    callback(str);
}

ArduinoCommander.prototype.processData = function(data){
    console.log("data received:[" + data + "]");
};