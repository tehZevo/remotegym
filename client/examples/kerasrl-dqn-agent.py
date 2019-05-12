import numpy as np
import gym
import argparse

from keras.models import Sequential
from keras.layers import Dense, Activation, Flatten, Input, Reshape, BatchNormalization
from keras.optimizers import Adam

from rl.agents.dqn import DQNAgent
from rl.policy import BoltzmannQPolicy, EpsGreedyQPolicy
from rl.memory import SequentialMemory

import matplotlib.pyplot as plt

from remote_env import RemoteEnv
from graph_stuff import graph_stuff

parser = argparse.ArgumentParser()
parser.add_argument('--url', type=str, default="http://localhost:3000")
parser.add_argument('--layers', type=int, nargs="+", default=[16, 16, 16])
parser.add_argument("--activation", type=str, default="elu")
parser.add_argument("--seed", type=int, default=123)
parser.add_argument("--nb_steps", type=int, default=1000000)
parser.add_argument("--memory_size", type=int, default=100000)
parser.add_argument("--window_length", type=int, default=1)

args = parser.parse_args()

env = RemoteEnv(args.url)

np.random.seed(args.seed)
#env.seed(args.seed) #TODO: support remote env seeding

nb_actions = env.action_space.n

#print(env.observation_space.shape)
# Next, we build a very simple model.
model = Sequential()
model.add(Reshape((np.product((args.window_length,) + env.observation_space.shape),), input_shape=(args.window_length,) + env.observation_space.shape))
#model.add(Flatten(input_shape=(1,) + env.observation_space.shape))
for i, layer_size in enumerate(args.layers):
  model.add(BatchNormalization())
  model.add(Dense(layer_size, activation=args.activation))
model.add(Dense(nb_actions, activation="linear"))

print(model.summary())

# Finally, we configure and compile our agent. You can use every built-in Keras optimizer and
# even the metrics!
memory = SequentialMemory(limit=args.memory_size, window_length=args.window_length)
#policy = BoltzmannQPolicy() #TODO: parameterize
policy = EpsGreedyQPolicy(0.1)
dqn = DQNAgent(model=model, nb_actions=nb_actions, memory=memory, nb_steps_warmup=10,
               target_model_update=1e-2, policy=policy)
dqn.compile(Adam(lr=1e-3), metrics=['mae'])

hist = dqn.fit(env, nb_steps=args.nb_steps, visualize=False, verbose=2)
rewards = hist.history["episode_reward"]
#print(rewards)
# After training is done, we save the final weights.
#dqn.save_weights('dqn_{}_weights.h5f'.format("remote"), overwrite=True)

# Finally, evaluate our algorithm for 5 episodes.
#dqn.test(env, nb_episodes=100, visualize=False)

graph_stuff(rewards)

plt.savefig("out.png")
