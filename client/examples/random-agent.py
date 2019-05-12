from remotegym.remote_env import RemoteEnv
from remotegym.utils import RandomAgent

#TODO: cli args

env = RemoteEnv("http://localhost:3000")
agent = RandomAgent(env.action_space)

obs = env.reset()

for i in range(100):
  action = agent.act(obs)
  obs, reward, done, info = env.step(action)
  print("state: {}, action: {}, reward: {}".format(obs, action, reward))
  if done:
    obs = env.reset();
