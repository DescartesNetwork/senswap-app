import numpy as np

def get_marginal_price(x, y, a, b):
    """
    Calculate marginal price of a pool
    """

    p_x = 2*(x-a) + b*y
    p_y = 2*(y-a) + b*x
    return p_x / p_y

def init_pool(x, y, b=0, f=1):
    """
    Calculate pool's parameters when pool initialized
    """

    assert x > 0, "Reserve must be greater than 0"
    assert y > 0, "Reserve must be greater than 0"

    a = x + y + np.sqrt( (2-b)*x*y + f )
    return a


