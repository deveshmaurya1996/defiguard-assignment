import React from 'react';
import Wallet from '../../components/wallet';
import './index.css';

const WalletPage = () => {
  return (
    <div className="wallet-page">
      <div className="container">
        <h1 className="page-title">Ethereum Wallet</h1>
        <p className="page-description">
          Send and receive ETH securely with your personal wallet.
        </p>
        <Wallet />
      </div>
    </div>
  );
};

export default WalletPage;