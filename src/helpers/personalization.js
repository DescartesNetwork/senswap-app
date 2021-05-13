import storage from 'helpers/storage';

class Personalization {
  constructor(walletAddress) {
    this.walletAddress = walletAddress;
  }

  // Favorite accounts
  getFavoriteAccounts = () => {
    const { personalization } = storage.get(this.walletAddress) || {};
    const { favouriteAccounts } = personalization || {};
    return favouriteAccounts || [];
  }
  addFavoriteAccount = (accountAddress) => {
    const { personalization, ...others } = storage.get(this.walletAddress) || {};
    const { favouriteAccounts, ...someothers } = personalization || {};
    let newFavAccAddr = favouriteAccounts || [];
    if (newFavAccAddr.includes(accountAddress)) return;
    newFavAccAddr.push(accountAddress);
    return storage.set(this.walletAddress, {
      ...others,
      personalization: {
        ...someothers,
        favouriteAccounts: newFavAccAddr
      }
    });
  }
  removeFavoriteAccount = (accountAddress) => {
    const { personalization, ...others } = storage.get(this.walletAddress) || {};
    const { favouriteAccounts, ...someothers } = personalization || {};
    let newFavAccAddr = favouriteAccounts || [];
    newFavAccAddr = newFavAccAddr.filter(address => (address !== accountAddress));
    return storage.set(this.walletAddress, {
      ...others,
      personalization: {
        ...someothers,
        favouriteAccounts: newFavAccAddr
      }
    });
  }
}

export default Personalization;