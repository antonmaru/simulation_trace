const ethers = require('ethers');
const { exec } = require('child_process');

// Uniswap V2 Router ABI for swapExactETHForTokens only
const UniswapV2Router02ABI = [{
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountOutMin",
        "type": "uint256"
      },
      {
        "internalType": "address[]",
        "name": "path",
        "type": "address[]"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "swapExactETHForTokens",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "amounts",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  }];

// Uniswap V2 Router address on Ethereum mainnet
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

// USDC address on Ethereum mainnet
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

// Anvil RPC URL (adjust if necessary)
const ANVIL_RPC_URL = 'http://127.0.0.1:8899';

const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

async function performSwaps() {

   // Anvil should be launched with the following command:
   // anvil --fork-url https://mainnet.infura.io/v3/ccd3e14df8c34c8ca140743a5548362a --port 8899


  // Connect to the local Anvil node
  const provider = new ethers.JsonRpcProvider(ANVIL_RPC_URL);

  // Get a signer (use the first account provided by Anvil)
  const signer = await provider.getSigner(0);

  // Create contract instance
  const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UniswapV2Router02ABI, signer);

  
  // Parameters for the swap
  const amountIn = ethers.parseEther('0.001'); // 1 ETH
  const amountOutMin = 0; // We don't care about slippage for this test
  const path = [WETH, USDC_ADDRESS];
  const to = await signer.getAddress();
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now


  console.log(`Starting a swap...`);
  const startTime = Date.now();
  let tx_hash;

    try {
        const tx = await router.swapExactETHForTokens(
        amountOutMin,
        path,
        to,
        deadline,
        { value: amountIn }
        );
      await tx.wait();
        tx_hash = tx.hash;
        console.log("Transaction Hash: ", tx_hash);
    } catch (error) {
        console.error(`Error in swap:`, error);
    }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000; // Convert to seconds

  console.log(`Completed a swap in ${duration} seconds`);

  console.log(`Getting transaction trace...`);

  const call_cast = `cast run ${tx_hash} --rpc-url ${ANVIL_RPC_URL}`;

  exec(call_cast, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
  
    if (stderr) {
      console.error(`Error in command output: ${stderr}`);
      return;
    }
  
    console.log(`Command output: ${stdout}`);
  });
}

performSwaps().catch(console.error);