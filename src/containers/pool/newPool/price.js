import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import ssjs from 'senswapjs';

import utils from 'helpers/utils';

function Price(props) {
  const [price, setPrice] = useState(0);
  const { ticket } = props;
  useEffect(() => {
    if (!ticket) return setPrice(0);
    return ssjs.parseCGK(ticket).then(({ price }) => {
      return setPrice(price);
    }).catch(er => {
      return console.error(er);
    });
  }, [ticket]);

  return <Fragment>Price: ${utils.prettyNumber(price)}</Fragment>
}

Price.defaultProps = {
  ticket: '',
}

Price.propTypes = {
  ticket: PropTypes.string,
}

export default Price;