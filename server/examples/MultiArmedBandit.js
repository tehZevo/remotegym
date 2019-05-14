var EnvironmentServer = require("../EnvironmentServer.js");

class MABEnvironment extends EnvironmentServer
{
  constructor(numArms)
  {
    super({
      type: "discrete",
      n: 1
    }, {
      type: "discrete",
      n: numArms
    });

    this.reset();

    this.numArms = numArms;
    this.correctArm = Math.floor(Math.random() * this.numArms);
  }

  step(action)
  {
    var obs = 0;
    console.log(action, this.correctArm)
    var reward = action == this.correctArm ? 1 : 0;
    var done = true;
    var info = null;

    return [obs, reward, done, info];
  }

  reset()
  {
    return 0;
  }
}

module.exports = MABEnvironment;
