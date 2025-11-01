require('dotenv').config();
const { ethers } = require('ethers');

function getProvider() {
  const rpc = process.env.RPC_URL;
  if (!rpc || !rpc.trim()) {
    throw new Error('RPC_URL is not set');
  }
  return new ethers.providers.JsonRpcProvider(rpc);
}

function getSigner(provider) {
  const pk = process.env.PRIVATE_KEY;
  if (!pk || !pk.trim()) {
    throw new Error('PRIVATE_KEY is not set');
  }
  return new ethers.Wallet(pk, provider || getProvider());
}

async function getNetworkInfo(provider) {
  const p = provider || getProvider();
  const [network, blockNumber] = await Promise.all([p.getNetwork(), p.getBlockNumber()]);
  return { chainId: network.chainId, name: network.name, blockNumber };
}

module.exports = { getProvider, getSigner, getNetworkInfo };
