import storage from 'helpers/storage';

class Personalization {
  constructor(walletAddress) {
    this.walletAddress = walletAddress;
  }

  // Favorite accounts
  getFavoriteAccounts = () => {
    const { favouriteAccounts } = storage.get(this.walletAddress) || {};
    return favouriteAccounts || [];
  }
  addFavoriteAccount = (accountAddress) => {
    const { favouriteAccounts, ...others } = storage.get(this.walletAddress) || {};
    let newFavAccAddr = favouriteAccounts || [];
    if (newFavAccAddr.includes(accountAddress)) return;
    newFavAccAddr.push(accountAddress);
    return storage.set(this.walletAddress, {
      ...others,
      favouriteAccounts: newFavAccAddr
    });
  }
  removeFavoriteAccount = (accountAddress) => {
    const { favouriteAccounts, ...others } = storage.get(this.walletAddress) || {};
    let newFavAccAddr = favouriteAccounts || [];
    newFavAccAddr = newFavAccAddr.filter(address => (address !== accountAddress));
    return storage.set(this.walletAddress, {
      ...others,
      favouriteAccounts: newFavAccAddr
    });
  }
}

export default Personalization;