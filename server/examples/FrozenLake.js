var EnvironmentServer = require("../EnvironmentServer.js");

class FrozenLake extends EnvironmentServer
{
  constructor(worldSize, numHoles, numGoals)
  {
    worldSize = worldSize || 4
    numHoles = numHoles == null ? 1 : numHoles
    numGoals = numGoals || 1

    super({
      type: "discrete",
      n: worldSize * worldSize
    }, {
      type: "discrete",
      n: 4
    });

    //TODO: parameterize
    this.oobKill = false;

    this.size = worldSize;
    this.numHoles = numHoles;
    this.numGoals = numGoals;

    this.player = {x:-1, y:-1};
    this.start = {x:-1, y:-1};

    this.maxSteps = 200;
    this.curSteps = 0;

    this.setup();

    this.reset();
  }

  setup()
  {
    this.holes = [];
    this.goals = [];

    //just dont add too many holes/goals ;)
    this.start = this.randomOpenPos();
    this.player = {x:this.start.x, y:this.start.y};

    for(var i = 0; i < this.numHoles; i++)
    {
      this.holes.push(this.randomOpenPos());
    }

    for(var i = 0; i < this.numGoals; i++)
    {
      this.goals.push(this.randomOpenPos());
    }
  }

  randomOpenPos()
  {
    var [x, y] = [randInt(this.size), randInt(this.size)];

    while(!this.isOpen(x, y))
    {
      [x, y] = [randInt(this.size), randInt(this.size)];
    }

    return {x:x, y:y};
  }

  isInBounds(x, y)
  {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  isOpen(x, y)
  {
    if(this.isHole(x, y))
    {
      return false;
    }

    if(this.isGoal(x, y))
    {
      return false
    }

    if(this.player.x == x && this.player.y == y)
    {
      return false;
    }

    return true;
  }

  isGoal(x, y)
  {
    return this.goals.filter((e) => e.x == x && e.y == y).length > 0;
  }

  isHole(x, y)
  {
    return this.holes.filter((e) => e.x == x && e.y == y).length > 0;
  }

  step(action)
  {
    var p = {x:this.player.x, y:this.player.y};
    var reward = 0;
    var done = false;

    switch(action)
    {
      case 0: p.y += 1; break;
      case 1: p.y -= 1; break;
      case 2: p.x += 1; break;
      case 3: p.x -= 1; break;
    }

    if(this.isGoal(p.x, p.y))
    {
      reward += 1;
      done = true;
      console.log(`touched goal at [${p.x}, ${p.y}]`);
    }

    if(!this.isInBounds(p.x, p.y))
    {
      if(this.oobKill)
      {
        reward -= 1;
        done = true;
        console.log(`walked oob at [${p.x}, ${p.y}]`);
      }

      p = {x:this.player.x, y:this.player.y}; //prevent movement
    }

    if(this.isHole(p.x, p.y))
    {
      reward -= 1;
      done = true;
      console.log(`fell into hole at [${p.x}, ${p.y}]`);
    }

    //write new player pos
    this.player = p;

    var obs = this.xy2obs(p.x, p.y);
    var info = null;

    this.curSteps++;
    if(!done && this.curSteps >= this.maxSteps)
    {
      reward -= 1;
      done = true;
      console.log("timed out");
    }

    console.log(this.toString());

    return [obs, reward, done, info];
  }

  xy2obs(x, y)
  {
    return y * this.size + x;
  }

  reset()
  {
    //move to start
    this.player = {x:this.start.x, y:this.start.y};
    this.curSteps = 0;

    return this.xy2obs(this.player.x, this.player.y);
  }

  toString()
  {
    //TODO: flip y? idk
    var s = "";
    for(var y = 0; y < this.size; y++)
    {
      for(var x = 0; x < this.size; x++)
      {
        s += this.getChar(x, y);
      }

      s += "\n";
    }

    return s;
  }

  getChar(x, y)
  {
    var HOLE = "X";
    var PLAYER = "P";
    var START = "S";
    var GOAL = "G";
    var GROUND = ".";

    return this.player.x == x && this.player.y == y ? PLAYER :
      this.isHole(x, y) ? HOLE : this.isGoal(x, y) ? GOAL :
      this.start.x == x && this.start.y == y ? START : GROUND;
  }
}

module.exports = FrozenLake

function randInt(low, ogHigh)
{
  var high = ogHigh == null ? low : ogHigh;
  low = ogHigh == null ? 0 : low

  return Math.floor(Math.random() * (high - low) + low)
}

var args = process.argv.slice(2);
var port = args[0] || 3000;
var env = new FrozenLake(8, 1, 1);
env.listen(port);
