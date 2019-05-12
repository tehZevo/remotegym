import matplotlib.pyplot as plt
import math
import numpy as np

def ema(x, alpha=0.01):
  mean = []
  variance = []

  for val in x:
    val = 0 if math.isnan(val) or val is None else val #ree

    if len(mean) == 0:
      mean.append(val)
      variance.append(0)
    else:
      diff = val - mean[-1]
      mean.append(mean[-1] + diff * alpha)
      variance.append(variance[-1] + (abs(diff) - variance[-1]) * alpha)
  mean = np.array(mean)
  variance = np.array(variance)
  return (mean, variance)

def graph_stuff(x, title="", ema_alpha=0.1):
  plt.title(title)
  col = "C{}".format(0 % 10)
  plt.plot(x, color=col, alpha = 0.25)
  #plt.yscale("log")
  mean, variance = ema(x, ema_alpha)

  plt.fill_between(range(len(mean)), mean + variance, mean - variance, color=col, alpha=0.25)
  plt.plot(mean, color=col, linestyle="dashed")
  #plt.plot(mean + variance, color=col, linestyle="solid")
  #plt.plot(mean - variance, color=col, linestyle="solid")

#from https://github.com/openai/gym/blob/master/examples/agents/random_agent.py
class RandomAgent(object):
  """The world's simplest agent!"""
  def __init__(self, action_space):
    self.action_space = action_space

  def act(self, observation):
    return self.action_space.sample()
