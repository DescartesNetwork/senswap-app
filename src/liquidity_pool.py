import numpy as np
from utils import init_pool, get_marginal_price

# token = {
#     'name': "dfafd",
#     'symbol': "DA",
#     'reserve': 0.0
# }

class LiquidityPool(object):
    def __init__(self, token_1: dict, token_2: dict):
        super(LiquidityPool, self).__init__()
        self.name = token_1.name + '/' + token_2.name
        self.token_1 = token_1
        self.token_2 = token_2
        
        # Parameters
        self.b = 0
        self.f = 1
        self.a = init_pool(token_1.reserve, token_2.reserve, self.b, self.f)
        

    def swap(self, token_out=None, out_=0., token_in=None):
        # TODO: define trading procedure
        in_ = 0
        return in_

    def add_liquidity(self):
        # TODO: define liquidity provision procedure
        return 0

    def get_price_oracle(self):
        return get_marginal_price(self.token_1.reserve,
                                self.token_2.reserve,
                                self.a,
                                self.b)
