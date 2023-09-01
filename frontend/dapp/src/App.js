//Import necessary libraries and packages
import './App.css'
import {useState} from 'react'
import {Buffer} from 'buffer';
import idl from './idl.json'
import logo from './blockchain.png';
import { Connection, PublicKey, clusterApiUrl  } from '@solana/web3.js';
import { Program, AnchorProvider, web3} from '@project-serum/anchor';
 
//Declaring necessary paramaters
const {SystemProgram,Keypair} = web3;
window.Buffer = Buffer
const programID = new PublicKey('CyeBbYJ6xgihWbQLraz6TPAS1mfhatv3BXFUhfcNXfnu')
const opts = {
    preflightCommitment:"processed",
}
const network = clusterApiUrl('devnet')
var account = Keypair.generate(); 
var txSignature = null

function App() {
  //Declaration of variables
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [favpet, setFavpet] = useState("");

  const [fetchName, setfName] = useState("");
  const [fetchAge, setfAge] = useState("");
  const [fetchFavpet, setfFavpet] = useState("");

  const [walletaddress, setWalletAddress] = useState("");
  const [tx, setTx] = useState("");
  const [showContent, setShowContent] = useState(false);

  //Function: shows content when true
  const toggleContent = () => {
    setShowContent(!showContent);
  };

  //Function: resets all inputs
  const resetInputs = () => {
    setName('')
    setAge('')
    setFavpet('')
    setfName('')
    setfAge('')
    setfFavpet('')
  }

  //Function: get provider
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  //Function: connect to phantom wallet
  const connectWallet = async () => {
    if (walletaddress) {
      account = Keypair.generate();
      window.solana.disconnect()
      setWalletAddress("")
      resetInputs();
      setTx(null)
    }

    if (!window.solana) {
      alert("Error: Wallet not found, Please install Sollet or Phantom extension.");
      return;
    }

    try {
      await window.solana.connect();
      const provider = getProvider();
      const walletAddress = provider.wallet.publicKey.toString();
      setWalletAddress(walletAddress);
      toggleContent();
    } catch (err) {
      console.error("Error connecting to wallet:", err);
    }
    };
  

    //Function: saves inputted data
    const inputData = async () => {
      account = Keypair.generate();
      setTx(null)

      const dataAcc = account;
      console.log(dataAcc);
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
    
      try {
        txSignature = await program.rpc.initialize(name, age, favpet, {
          accounts: {
            initAccount: account.publicKey,
            signer: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [account],
        });  
        alert("Transaction is being processed, please wait....")
        const transaction = await provider.connection.getTransaction(txSignature, 'confirmed');
        console.log(transaction)

        setTx(txSignature);
        resetInputs();
      } catch (err) {
        console.error("Transaction Error:", err);
      }

      resetInputs();
    }

    //Function: retrieves inputted data from transaction
    const retrieveData = async () => {
      if (fetchName.length >= 2 || fetchAge.length >= 2 || fetchFavpet.length >= 2) {
        resetInputs();
        return
      }
      try { 
        const provider = getProvider();
        const transaction = await provider.connection.getTransaction(tx.toString(), 'confirmed'); 
        setfName(transaction.meta.logMessages[8].slice(18))
        setfAge(transaction.meta.logMessages[9].slice(17))
        setfFavpet(transaction.meta.logMessages[10].slice(26))
      } catch (error) {
        console.error('Fetching Error:', error); 
      }
    };
    
    //Function: show wallet through prompt
    const showWallet = () => {
      alert("Wallet Public Key: " + walletaddress)
    }

    //Website Interface
    return (
      <div className="App">
        <header className="App-header">
        {!showContent ? (
          <div className="greeting">
            <img src={logo} className="App-logo" alt="logo" />
            <h1>Welcome to AJ's Solana Program</h1>
            <button className="button" onClick={connectWallet}>Connect Wallet</button>
          </div>
        ) : (
          <div className="content">
            <div className="Left-pane">
              <button className="button topleft" onClick={showWallet}>Show Wallet</button>
              <div className="contentbox1">  
                {<h3>Input User Information</h3>}
                {<p>Name: {walletaddress && <input value={name} onChange={(e) => setName(e.target.value)} />}</p>}
                {<p>Age: {walletaddress && <input value={age} onChange={(e) => setAge(e.target.value)} />}</p>}
                {<p>Favorite Pet: {walletaddress && <input value={favpet} onChange={(e) => setFavpet(e.target.value)} />}</p>}
                {walletaddress && <button className="button2" onClick={inputData}>Submit</button>}
              </div> 
            </div>  
    
            <div className="Right-pane">
              {walletaddress && tx && 
                <a
                  className="button topright"
                  href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                Show Transaction
                </a>}
              <div className="contentbox2">
                {<h3>Retrieve Information</h3>}
                {walletaddress && tx && <button className="button2" onClick={retrieveData}>Fetch Transaction Input</button>}
                {walletaddress && fetchName.length >= 2 && <p>Your Name: {fetchName}</p>}
                {walletaddress && fetchAge.length >= 2 && <p>Your Age: {fetchAge}</p>} 
                {walletaddress && fetchFavpet.length >= 2 && <p>Your Favorite Pet: {fetchFavpet}</p>}
              </div>
              <button className="button bottom" onClick={toggleContent}>Disconnect Wallet</button>      
            </div>
          </div>  
        )}
        </header>
      </div>
    );
}

export default App;
