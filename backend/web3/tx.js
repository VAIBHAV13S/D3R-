const { ethers } = require('ethers');

function normalizeTxError(err) {
  const e = err || {};
  const msg = e.error?.message || e.reason || e.message || String(e);
  const code = e.code || e.error?.code;
  return { message: msg, code };
}

async function sendAndWait(txPromise, confirmations = 1) {
  try {
    const tx = await txPromise;
    const receipt = await tx.wait(confirmations);
    const status = receipt.status === 1 ? 'success' : 'failed';
    return { status, txHash: receipt.transactionHash, receipt };
  } catch (err) {
    const norm = normalizeTxError(err);
    return { status: 'error', error: norm };
  }
}

async function getTxStatus(provider, txHash) {
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) return { status: 'pending' };
  return { status: receipt.status === 1 ? 'success' : 'failed', receipt };
}

module.exports = { sendAndWait, getTxStatus, normalizeTxError };
