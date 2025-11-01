param(
  [Parameter(Mandatory=$false)][string]$Network = "sepolia",
  [Parameter(Mandatory=$true)][string]$RpcUrl,
  [Parameter(Mandatory=$true)][string]$PrivateKeyNumber,
  [Parameter(Mandatory=$true)][string]$EtherscanApiKey
)

$ErrorActionPreference = 'Stop'

# Move to repo root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $rootDir

# Set env for Foundry script
$env:NETWORK = $Network
$env:PRIVATE_KEY_NUMBER = $PrivateKeyNumber
$env:ETHERSCAN_API_KEY = $EtherscanApiKey

Write-Host "==> Deploying to $Network"
forge script script/Deploy.s.sol:DeployScript --rpc-url $RpcUrl --broadcast

$addressesFile = Join-Path $rootDir 'config\addresses.json'
if (-not (Test-Path $addressesFile)) {
  throw "addresses.json not found at $addressesFile"
}

# Read addresses from JSON
$all = Get-Content $addressesFile | ConvertFrom-Json
$addrs = $all.$Network
if (-not $addrs) {
  throw "Network '$Network' not found in addresses.json"
}

$donation = $addrs.donationTracker
$ipfs = $addrs.ipfsVerifier
$oracle = $addrs.disasterOracle

if (-not $donation -or -not $ipfs -or -not $oracle) {
  throw "Missing one or more contract addresses in addresses.json"
}

Write-Host "==> Deployed addresses ($Network):"
Write-Host "DonationTracker: $donation"
Write-Host "IPFSVerifier:   $ipfs"
Write-Host "DisasterOracle: $oracle"

# Verify
$env:ETHERSCAN_API_KEY = $EtherscanApiKey

Write-Host "==> Verifying DonationTracker"
forge verify-contract --chain $Network $donation 'contracts/DonationTracker.sol:DonationTracker' --constructor-args '' --watch

Write-Host "==> Verifying IPFSVerifier"
forge verify-contract --chain $Network $ipfs 'contracts/IPFSVerifier.sol:IPFSVerifier' --constructor-args '' --watch

Write-Host "==> Verifying DisasterOracleMock"
forge verify-contract --chain $Network $oracle 'contracts/DisasterOracleMock.sol:DisasterOracleMock' --constructor-args '' --watch

# Output summary file
$summary = Join-Path $rootDir ("config/addresses-$Network.txt")
@(
  "Network: $Network",
  "RPC: $RpcUrl",
  "DonationTracker: $donation",
  "IPFSVerifier:   $ipfs",
  "DisasterOracle: $oracle"
) | Set-Content -Path $summary -NoNewline:$false

Write-Host "==> Addresses written to $summary"
