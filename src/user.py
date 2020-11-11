import numpy as np

# TODO: define user's wallet
class User(object):
    def __init__(self):
        super(User, self).__init__()
        self.portfolio = dict()
        self.pool_share = dict()
