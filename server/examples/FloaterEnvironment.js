var EnvironmentServer = require("../EnvironmentServer.js");

//TODO rename to puck world?
class FloaterEnvironment extends EnvironmentServer
{
  constructor()
  {
    super({
      type: "box",
      low: -1,
      high: 1,
      shape: [6],
      dtype: "float32"
    }, {
      type: "discrete",
      n: 5
    });

    this.thrust = 0.1;
    this.friction = 0.001;
    this.gravity = 0;//0.01;
    this.borderReward = -1;
    this.maxSteps = 200;
    this.curSteps = 0;

    this.reset();
  }

  step(action)
  {
    //0 - no action
    //1 - thrust up
    //2 - thrust right
    //3 - thrust left

    var p = this.player;
    var t = this.target;
    var reward = 0;
    var done = false;

    switch(action)
    {
      case 0: break;
      case 1: p.vx += this.thrust; break;
      case 2: p.vx -= this.thrust; break;
      case 3: p.vy += this.thrust; break;
      case 4: p.vy -= this.thrust; break;
    }
    //console.log(this.curSteps);

    //move player
    p.x += p.vx;
    p.y += p.vy;

    //clamp player x/y
    //p.x = Math.max(-1, Math.min(p.x, 1));
    //p.y = Math.max(-1, Math.min(p.y, 1));

    //add distance reward
    reward += this.calcReward();

    //punish and end episode if outside border
    if(p.x < -1 || p.x > 1 || p.y < -1 || p.y > 1)
    {
      reward += this.borderReward;
      done = true;
    }

    //apply friction
    p.vy *= 1-this.friction;
    p.vy *= 1-this.friction;

    //apply gravity
    p.vy -= this.gravity;

    this.curSteps++;

    if(this.curSteps >= this.maxSteps)
    {
      done = true;
    }

    var obs = this.getState();
    var info = null;

    return [obs, reward, done, info];
  }

  //reward based on distance to target (closer is better)
  calcReward()
  {
    var dx = this.player.x - this.target.x;
    var dy = this.player.y - this.target.y;

    return -Math.sqrt(dx * dx + dy * dy);
  }

  reset()
  {
    this.curSteps = 0;

    var px = Math.random() * 2 - 1;
    var py = Math.random() * 2 - 1;
    this.player = {x:px, y:py, vx:0, vy:0};

    var tx = 0;//Math.random() * 2 - 1;
    var ty = 0;//Math.random() * 2 - 1;
    this.target = {x:tx, y:ty};

    return this.getState();
  }

  getState()
  {
    var p = this.player;
    var t = this.target;
    return [p.x, p.y, p.vx, p.vy, t.x, t.y];
  }
}

module.exports = FloaterEnvironment;

var args = process.argv.slice(2);
var port = args[0] || 3000;
var env = new FloaterEnvironment();
env.listen(port);
