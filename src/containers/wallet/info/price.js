import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ssjs from 'senswapjs';

import Typography from 'senswap-ui/typography';

import utils from 'helpers/utils';

function Price(props) {
  const [usd, setUSD] = useState(0);
  const { amount, ticket } = props;
  useEffect(() => {
    return ssjs.parseCGK(ticket).then(({ price }) => {
      return setUSD(price * amount);
    }).catch(er => {
      return console.error(er);
    });
  }, [amount, ticket]);

  return <Typography variant="h5" color="textSecondary">{utils.prettyNumber(usd)} USD</Typography>
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