const { getProvider } = require('./provider');

function onContractEvents(contract, eventFilter, handler) {
  const remove = () => {
    try { contract.removeListener(eventFilter, handler); } catch (_) {}
  };
  contract.on(eventFilter, handler);
  return remove;
}

function onceBlock(handler) {
  const provider = getProvider();
  const listener = (blockNumber) => handler(blockNumber);
  provider.once('block', listener);
  return () => provider.off('block', listener);
}

function watchBlocks(handler) {
  const provider = getProvider();
  const listener = (blockNumber) => handler(blockNumber);
  provider.on('block', listener);
  return () => provider.off('block', listener);
}

module.exports = { onContractEvents, onceBlock, watchBlocks };
