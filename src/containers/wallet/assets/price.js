import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';

import Typography from 'senswap-ui/typography';

import utils from 'helpers/utils';

function Price(props) {
  const [usd, setUSD] = useState(0);
  const [price, setPrice] = useState(0);
  const { amount, ticket } = props;
  useEffect(() => {
    return (async () => {
      try {
        const { price } = await utils.fetchCGK(ticket);
        setPrice(price);
        setUSD(price * amount);
      } catch (er) { /* Do nothing */ }
    })();
  }, [amount, ticket]);

  return <Fragment>
    <Typography>${utils.prettyNumber(usd)}</Typography>
    <Typography variant="body2" color="textSecondary">${utils.prettyNumber(price)}</Typography>
  </Fragment>
}

Price.defaultProps = {
  amount: 0,
  ticket: '',
}

Price.propTypes = {
  amount: PropTypes.number,
  ticket: PropTypes.string,
}

export default Price;