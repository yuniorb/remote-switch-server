
var app = require('express')();
var server = require('http').Server(app).listen(80)
var io = require('socket.io')(server);

// Initiate communications with arduino
//var ArduinoCommander = require('./ArduinoCommander.js');
//var ac = new ArduinoCommander();
//ac.init();

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

var switchState = false;

io.on('connection', function(socket,pressed)
{
	console.log("a user connected");
	socket.emit('switch', get_switch_object("switch1", switchState));
	socket.emit('switch', get_switch_object("switch2", switchState));
	socket.on('pressed', function(data)
	{
	    if (!data) {
	        console.log("No data sent to press function");
	    }

	    console.log("Command received from client: " + data);

	    map_client_command_to_server_command(data, function (command) {
	        ac.sendCommand(command, function (err, result) {
	            console.log("Command sent successfully");
	        });
	    });
	});

	socket.on("add user", function (username) {
	    console.log("Adding user:" + username);
        socket.emit("login", 
        	{
        		username:"test_username",
        		message:"welcome",
        		numUsers:1
        	})
	});

	socket.on("test-toggle", function(data)
	{
		console.log("Test - Toggling swtich state from:" + switchState);
		var switch_id = "switch1";
		if(switchState)
		{
			change_switch_status(switch_id, false)
		}
		else
		{
			change_switch_status(switch_id, true);
		}
	});
});

var commands = require("./commands.js");

function map_client_command_to_server_command(clientCommand, callback) {
    switch (clientCommand) {
        case "tf-power":
            callback(commands.towerFanPower);
            break;
        case "tf-speed":
            callback(commands.towerFanSpeed);
            break;
        case "tf-oscillate":
            callback(commands.towerFanOscillate);
            break;
        case "tf-timer":
            callback(commands.towerFanTimer);
            break;
        case "bf-power":
            callback(commands.laskoFanPower);
            break;
        case "bf-speed":
            callback(commands.laskoFanSpeed);
            break;        
        case "bf-timer":
            callback(commands.laskoFanTimer);
            break;
        default:
            console.log("No mapping found for client command:" + clientCommand);
            break;
    };
};

function change_switch_status(switch_id, value)
{
	switchState = value;
	var obj = get_switch_object(switch_id, value);
	io.emit("switch", obj);
};

function get_switch_object(switch_id, value)
{
	var obj = {
		"id":switch_id,
		"date" : new Date().toJSON(),
		"name" : get_switch_name(switch_id),
		"status": value
	};
	return obj;
};

function get_switch_name(switch_id)
{
	return "Friendly Name";
}



