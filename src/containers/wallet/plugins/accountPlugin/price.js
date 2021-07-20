import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ssjs from 'senswapjs';

import Typography from 'senswap-ui/typography';

import utils from 'helpers/utils';
import Utils from 'helpers/utils';

function Price(props) {
  const [usd, setUSD] = useState(0);
  const { amount, ticket } = props;
  useEffect(() => {
    return Utils.fetchCGK(ticket).then(({ price }) => {
      setUSD(price * amount);
    }).catch(er => {
      // Do nothing
    });
  }, [amount, ticket]);

  return <Typography color="textSecondary" align="right">${utils.prettyNumber(usd)}</Typography>
}

Price.defaultProps = {
  amount: 0,
  ticket: 'solana',
}

Price.propTypes = {
  amount: PropTypes.number,
  ticket: PropTypes.string,
}

export default Price;