import Web3 from 'web3';

class Web3Service {
  constructor() {
    this.connected = false;
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async connectWallet() {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask to use this feature!');
        return null;
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.connected = accounts && accounts.length > 0;
      return accounts[0];
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      return null;
    }
  }

  async getBalance(address) {
    try {
      const balance = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  async sendTransaction(from, to, amount) {
    try {
      const amountInWei = this.web3.utils.toWei(amount, 'ether');
      
      const transactionParameters = {
        from: from,
        to: to,
        value: amountInWei,
        gas: '21000',
      };
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      
      return txHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      return null;
    }
  }

  async getNetwork() {
    try {
      const networkId = await this.web3.eth.net.getId();
      switch (networkId) {
        case 1:
          return 'Ethereum Main Network (Mainnet)';
        case 3:
          return 'Ropsten Test Network';
        case 4:
          return 'Rinkeby Test Network';
        case 5:
          return 'Goerli Test Network';
        case 42:
          return 'Kovan Test Network';
        case 56:
          return 'Binance Smart Chain';
        case 137:
          return 'Polygon Mainnet';
        default:
          return `Network ID: ${networkId}`;
      }
    } catch (error) {
      console.error('Error getting network:', error);
      return 'Unknown Network';
    }
  }

  async listenToAccountChanges(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        callback(accounts[0]);
      });
    }
  }

  async listenToNetworkChanges(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (networkId) => {
        callback(parseInt(networkId));
        window.location.reload();
      });
    }
  }

  isConnected() {
    return this.connected;
  }
}

const web3Service = new Web3Service();
export default web3Service;
