import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import ssjs from 'senswapjs';

import Typography from 'senswap-ui/typography';

import utils from 'helpers/utils';

function Price(props) {
  const [usd, setUSD] = useState(0);
  const { amount, ticket } = props;
  useEffect(() => {
    return ssjs.parseCGK(ticket).then(({ price }) => {
      setUSD(price * amount);
    }).catch(er => {
      return console.error(er);
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