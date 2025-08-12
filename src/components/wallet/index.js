import React, { useState, useEffect } from 'react';
import web3Service from '../../services/web3Service';
import createBlockie from 'ethereum-blockies-base64';
import './index.css';

const Wallet = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [network, setNetwork] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      const connectedAddress = window.ethereum.selectedAddress;
      await loadAccountData(connectedAddress);
      setAddress(connectedAddress);
    }
  };

  const loadAccountData = async (accountAddress) => {
    if (!accountAddress) return;

    setIsLoading(true);
    try {
      const accountBalance = await web3Service.getBalance(accountAddress);
      setBalance(accountBalance);

      const networkName = await web3Service.getNetwork();
      setNetwork(networkName);

      web3Service.listenToAccountChanges(handleAccountChange);
      web3Service.listenToNetworkChanges(() => window.location.reload());
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountChange = async (newAccount) => {
    if (newAccount) {
      setAddress(newAccount);
      await loadAccountData(newAccount);
    } else {
      setAddress('');
      setBalance('0');
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const account = await web3Service.connectWallet();
      if (account) {
        setAddress(account);
        await loadAccountData(account);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTransaction = async (e) => {
    e.preventDefault();
    
    if (!recipient || !amount || parseFloat(amount) <= 0) {
      setTransactionStatus({
        type: 'error',
        message: 'Please provide a valid recipient address and amount.'
      });
      return;
    }
    
    setIsLoading(true);
    setTransactionStatus(null);
    
    try {
      const txHash = await web3Service.sendTransaction(address, recipient, amount);
      
      if (txHash) {
        const newTransaction = {
          hash: txHash,
          from: address,
          to: recipient,
          amount: amount,
          timestamp: Date.now(),
        };
        
        setTransactions([newTransaction, ...transactions]);
        
        setTransactionStatus({
          type: 'success',
          message: `Transaction sent successfully! Hash: ${txHash}`
        });
        
        setRecipient('');
        setAmount('');
        
        setTimeout(async () => {
          const accountBalance = await web3Service.getBalance(address);
          setBalance(accountBalance);
        }, 3000);
      } else {
        setTransactionStatus({
          type: 'error',
          message: 'Transaction failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      setTransactionStatus({
        type: 'error',
        message: `Transaction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shortenAddress = (addr) => {
    return addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
  };

  const renderTransactionList = () => {
    if (transactions.length === 0) {
      return <p>No transactions yet.</p>;
    }
    
    return transactions.map((tx, index) => (
      <div className="transaction-item" key={index}>
        <div>
          <strong>To:</strong> {shortenAddress(tx.to)}
        </div>
        <div>
          <strong>Amount:</strong> {tx.amount} ETH
        </div>
        <div>
          <strong>Date:</strong> {new Date(tx.timestamp).toLocaleString()}
        </div>
        <div className="transaction-hash">
          <strong>TX:</strong> {shortenAddress(tx.hash)}
        </div>
      </div>
    ));
  };

  return (
    <div className="wallet-container">
      {!address ? (
        <div className="text-center">
          <h2>Connect your Ethereum Wallet</h2>
          <p>Connect your wallet to access your Ethereum funds and make transactions.</p>
          <button className="btn-primary" onClick={connectWallet} disabled={isLoading}>
            {isLoading ? (
              <>
                Connecting... <span className="loader"></span>
              </>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>
      ) : (
        <>
          <div className="wallet-header">
            <div className="wallet-address">
              <img 
                src={createBlockie(address)} 
                alt="Address Icon" 
                className="address-icon" 
              />
              <span title={address}>{shortenAddress(address)}</span>
            </div>
            <div className="network-badge">{network}</div>
          </div>
          
          <div className="wallet-balance">
            {isLoading ? (
              <span className="loader"></span>
            ) : (
              <>
                {parseFloat(balance).toFixed(4)}
                <span className="eth-symbol">ETH</span>
              </>
            )}
          </div>
          
          <div className="wallet-actions">
            <h3>Send ETH</h3>
            {transactionStatus && (
              <div className={`alert alert-${transactionStatus.type}`}>
                {transactionStatus.message}
              </div>
            )}
            <form onSubmit={sendTransaction}>
              <div className="form-group">
                <label htmlFor="recipient" className="form-label">Recipient Address</label>
                <input
                  type="text"
                  id="recipient"
                  className="form-control"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="amount" className="form-label">Amount (ETH)</label>
                <input
                  type="number"
                  id="amount"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  min="0.001"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isLoading || !address}
              >
                {isLoading ? (
                  <>Sending... <span className="loader"></span></>
                ) : (
                  'Send ETH'
                )}
              </button>
            </form>
          </div>
          
          <div className="transaction-list">
            <h3>Transaction History</h3>
            {renderTransactionList()}
          </div>
        </>
      )}
    </div>
  );
};

export default Wallet;
