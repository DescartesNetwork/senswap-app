import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';

import utils from 'helpers/utils';

function Price(props) {
  const [price, setPrice] = useState(0);
  const { ticket } = props;
  useEffect(() => {
    if (!ticket) return setPrice(0);
    return utils.fetchCGK(ticket).then(({ price }) => {
      return setPrice(price);
    }).catch(er => {
      // Do nothing
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