#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   NETWORK=sepolia RPC_URL=https://... PRIVATE_KEY_NUMBER=123... ETHERSCAN_API_KEY=... ./script/deploy-testnet.sh
# Notes:
# - PRIVATE_KEY_NUMBER must be decimal (not 0x hex) for vm.envUint.
# - NETWORK controls the key used in config/addresses.json.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Load backend/.env if present to populate defaults
if [ -f "$ROOT_DIR/backend/.env" ]; then
  # shellcheck disable=SC1090
  set -a
  . "$ROOT_DIR/backend/.env"
  set +a
fi

: "${NETWORK:=${NETWORK:-sepolia}}"

# Determine PRIVATE_KEY_NUMBER (decimal) — derive from PRIVATE_KEY if missing or invalid
is_digits() { case "$1" in (*[!0-9]*|"") return 1;; (*) return 0;; esac }

if ! is_digits "${PRIVATE_KEY_NUMBER:-}" ; then
  if [ -n "${PRIVATE_KEY:-}" ]; then
    if command -v node >/dev/null 2>&1; then
      PRIVATE_KEY_NUMBER="$(node -e "const k='${PRIVATE_KEY}'; if(!k||!k.startsWith('0x')){process.exit(1)}; console.log(BigInt(k).toString())")" || true
    fi
  fi
fi

: "${RPC_URL:=${RPC_URL:?RPC_URL is required}}"
: "${PRIVATE_KEY_NUMBER:=${PRIVATE_KEY_NUMBER:?PRIVATE_KEY_NUMBER is required (decimal)}}"
if ! is_digits "$PRIVATE_KEY_NUMBER" ; then
  echo "PRIVATE_KEY_NUMBER is not a valid decimal. Remove PRIVATE_KEY_NUMBER from backend/.env or set a pure decimal. If PRIVATE_KEY (hex) is present, the script will auto-derive." >&2
  exit 1
fi
: "${ETHERSCAN_API_KEY:=${ETHERSCAN_API_KEY:?ETHERSCAN_API_KEY is required for verification}}"

# Basic validation against placeholders
case "$RPC_URL" in
  *"..."*|*"<"*|*">"*)
    echo "RPC_URL appears to be a placeholder: $RPC_URL" >&2
    exit 1
    ;;
esac

export NETWORK
export PRIVATE_KEY_NUMBER

echo "==> Deploying to $NETWORK"
echo "RPC host: $(echo "$RPC_URL" | sed -E 's#https?://([^/]+)/.*#\1#')"
echo "PK source: $( [ -n "${PRIVATE_KEY:-}" ] && echo hex->dec || echo dec )"
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url "$RPC_URL" \
  --broadcast

ADDRESSES_JSON="$ROOT_DIR/config/addresses.json"
if [ ! -f "$ADDRESSES_JSON" ]; then
  echo "addresses.json not found at $ADDRESSES_JSON" >&2
  exit 1
fi

# Read addresses via node (avoids dependency on jq)
readarray -t OUT < <(node -e '
const fs=require("fs");
const p=require("path");
const f=p.join(process.cwd(),"config","addresses.json");
const net=process.env.NETWORK||"latest";
const j=JSON.parse(fs.readFileSync(f,"utf8"));
const a=j[net];
if(!a){console.error("Network not found in addresses.json");process.exit(2)}
console.log(a.donationTracker||"");
console.log(a.ipfsVerifier||"");
console.log(a.disasterOracle||"");
')

DONATION_ADDR="${OUT[0]}"
IPFS_ADDR="${OUT[1]}"
ORACLE_ADDR="${OUT[2]}"

if [ -z "$DONATION_ADDR" ] || [ -z "$IPFS_ADDR" ] || [ -z "$ORACLE_ADDR" ]; then
  echo "Failed to read contract addresses from config/addresses.json" >&2
  exit 1
fi

echo "==> Deployed addresses ($NETWORK):"
echo "DonationTracker: $DONATION_ADDR"
echo "IPFSVerifier:   $IPFS_ADDR"
echo "DisasterOracle: $ORACLE_ADDR"

# Verify contracts on Etherscan-compatible explorer
export ETHERSCAN_API_KEY

echo "==> Verifying DonationTracker"
forge verify-contract \
  --chain "$NETWORK" \
  "$DONATION_ADDR" \
  contracts/DonationTracker.sol:DonationTracker \
  --constructor-args '' \
  --watch

echo "==> Verifying IPFSVerifier"
forge verify-contract \
  --chain "$NETWORK" \
  "$IPFS_ADDR" \
  contracts/IPFSVerifier.sol:IPFSVerifier \
  --constructor-args '' \
  --watch

echo "==> Verifying DisasterOracleMock"
forge verify-contract \
  --chain "$NETWORK" \
  "$ORACLE_ADDR" \
  contracts/DisasterOracleMock.sol:DisasterOracleMock \
  --constructor-args '' \
  --watch

# Output summary file
SUMMARY="$ROOT_DIR/config/addresses-$NETWORK.txt"
{
  echo "Network: $NETWORK"
  echo "RPC: $RPC_URL"
  echo "DonationTracker: $DONATION_ADDR"
  echo "IPFSVerifier:   $IPFS_ADDR"
  echo "DisasterOracle: $ORACLE_ADDR"
} > "$SUMMARY"

echo "==> Addresses written to $SUMMARY"
