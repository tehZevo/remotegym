var Feeder = require("./Feeder.js")
var Floater = require("./Floater.js")
var FrozenLake = require("./FrozenLake.js")
var MultiArmedBandit = require("./MultiArmedBandit.js")

var args = process.argv.slice(2);
var port = args[0] || 3000;
//var env = new Feeder(8, 1, 1);
//var env = new FloaterEnvironment();
//var env = new MABEnvironment(3);
var env = new FrozenLake(8, 1, 1);
env.listen(port);
