# Takaful Insurance Smart Contract

A Sharia-compliant insurance (Takaful) smart contract built on Ethereum Sepolia testnet, enhanced with Zama's Fully Homomorphic Encryption (FHEVM) for privacy-preserving claim processing. Supports non-life insurance coverage including vehicles, property, and business assets.

## 🌟 Features

### Core Functionality
- **Individual Policies**: Single-person insurance policies
- **Group Policies**: Multi-member shared insurance pools
- **Contribution Management**: Track and manage member contributions
- **Claims Processing**: Submit, review, approve, and pay claims
- **Surplus Distribution**: Transparent end-of-term surplus sharing
- **Role-based Access Control**: Admin and claim approver roles

### Sharia Compliance
- **No Riba (Interest)**: No interest-based transactions
- **No Gharar (Excessive Uncertainty)**: Clear terms and transparent processes
- **No Maysir (Gambling)**: Risk-sharing rather than risk transfer
- **Mutual Assistance**: Pool-based cooperative insurance model

### Security Features
- **Reentrancy Protection**: Safe external calls
- **Pausable Contract**: Emergency stop functionality
- **Access Control**: Role-based permissions
- **Input Validation**: Comprehensive parameter checking

### Privacy Features (FHEVM)
- **Encrypted Claims**: Claim amounts stored as encrypted `euint32` on-chain
- **Zero-Knowledge Proofs**: Validate encrypted inputs without decryption
- **Selective Decryption**: Off-chain authorized parties decrypt claim amounts
- **Admin Payout Flow**: Admins set clear payout amounts after off-chain decryption

## 📋 Contract Structure

### Policy Types
```solidity
enum PolicyType { INDIVIDUAL, GROUP }
```

### Claim Status
```solidity
enum ClaimStatus { SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID }
```

### Key Roles
- `DEFAULT_ADMIN_ROLE`: Contract owner with full permissions
- `ADMIN_ROLE`: Platform administrators
- `CLAIM_APPROVER_ROLE`: Authorized claim reviewers

## 🚀 Deployment

### Prerequisites
1. Node.js and npm installed
2. Hardhat development environment
3. Ethereum Sepolia testnet account with SepoliaETH
4. Private key for deployment

### Environment Setup
Create a `.env` file in `takfi-contract/` with:
```env
SEPOLIA_PRIVATE_KEY=your_private_key_here
```

### Install & Compile
```bash
cd takfi-contract
npm install
npx hardhat compile
```

### Run Tests
```bash
# Run all tests (FHE test is skipped by default)
npx hardhat test

# Run tests with verbose output
NODE_OPTIONS="--max-old-space-size=4096" npx hardhat test --verbose
```

### Deploy to Sepolia Testnet
```bash
# Deploy original TakafulInsurance contract
npx hardhat ignition deploy ./ignition/modules/TakafulInsurance.ts --network sepolia

# Deploy FHE-enabled version (requires @fhevm/solidity)
npx hardhat run scripts/deploy-fhe-takaful.ts --network sepolia
```

## 📖 Usage Guide

### 1. Create Individual Policy
```solidity
function createPolicy(
    PolicyType _policyType,      // 0 for INDIVIDUAL
    uint256 _coverageAmount,     // Coverage limit in wei
    uint256 _contributionPerMember, // Required contribution
    uint256 _durationInDays     // Policy duration
) external payable returns (uint256)
```

### 2. Create Group Policy
```solidity
function createPolicy(
    PolicyType _policyType,      // 1 for GROUP
    uint256 _coverageAmount,     // Coverage limit in wei
    uint256 _contributionPerMember, // Required contribution per member
    uint256 _durationInDays     // Policy duration
) external payable returns (uint256)
```

### 3. Join Group Policy
```solidity
function joinPolicy(uint256 _policyId) external payable
```

### 4. Submit Claim (Original Contract - Cleartext)
```solidity
function submitClaim(
    uint256 _policyId,
    uint256 _claimAmount,
    string calldata _reason,
    string calldata _evidenceHash  // IPFS hash of evidence
) external returns (uint256)
```

### 4b. Submit Encrypted Claim (FHE Contract - Privacy)
```solidity
function submitClaim(
    uint256 _policyId,
    externalEuint32 inputEuint32,   // Encrypted claim amount (off-chain encrypted)
    bytes calldata inputProof,       // ZK proof binding encryption to msg.sender
    string calldata _reason,
    string calldata _evidenceHash
) external returns (uint256)
```

### 5. Process Claim (Admin/Group Leader)
```solidity
function processClaim(
    uint256 _claimId,
    bool _approve,
    string calldata _reason
) external
```

### 6. Pay Approved Claim
```solidity
function payClaim(uint256 _claimId) external
```

### 7. Close Policy and Distribute Surplus
```solidity
function closePolicy(uint256 _policyId) external
```

## 🔍 View Functions

### Policy Information
```solidity
function getPolicyDetails(uint256 _policyId) external view returns (...)
function getPolicyMembers(uint256 _policyId) external view returns (address[] memory)
function getMemberContribution(uint256 _policyId, address _member) external view returns (uint256)
```

### User Information
```solidity
function getUserPolicies(address _user) external view returns (uint256[] memory)
function getUserClaims(address _user) external view returns (uint256[] memory)
```

### Claim Information
```solidity
function getClaimDetails(uint256 _claimId) external view returns (...)
```

## 💰 Economics

### Platform Fee
- Default: 2.5% of total contributions
- Maximum: 10% (configurable by admin)
- Deducted during surplus distribution

### Surplus Distribution Formula
```
Surplus = Total Contributions - Total Claims - Platform Fee
Surplus Per Member = Surplus / Number of Members
```

## 🔒 Security Considerations

### Access Control
- Only policy members can submit claims
- Only admins or group leaders can approve claims
- Only admins can modify platform settings

### Financial Safety
- Reentrancy protection on all payable functions
- Balance checks before transfers
- Overflow protection with Solidity 0.8+

### Emergency Features
- Contract can be paused by admin
- Emergency withdrawal function for admin

## 🧪 Testing

The contract includes comprehensive tests covering:
- Policy creation (individual and group)
- Member joining and contributions
- Claims submission and processing
- Surplus distribution
- Access control
- Edge cases and error conditions

Run tests:
```bash
npx hardhat test
```

## 📊 Events

The contract emits detailed events for transparency:
- `PolicyCreated`: New policy creation
- `MemberJoined`: Member joining group policy
- `ContributionMade`: Contribution received
- `ClaimSubmitted`: New claim submission
- `ClaimStatusUpdated`: Claim approval/rejection
- `ClaimPaid`: Claim payment executed
- `SurplusDistributed`: Surplus distribution completed
- `PolicyClosed`: Policy closure

## 🌐 Network Configuration

### Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **RPC**: `https://sepolia.infura.io/v3/{YOUR_INFURA_KEY}` or `https://1rpc.io/sepolia`
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

### FHEVM Integration
- **Library**: `@fhevm/solidity` (v0.9.x)
- **Zama Docs**: https://docs.zama.org/protocol/solidity-guides/getting-started/quick-start-tutorial
- **Encrypted Types**: `euint32`, `euint64`, `euint128`, `euint256`
- **Relayer SDK**: Required for off-chain encryption and proof generation

### Gas Considerations
- Native currency is ETH (18 decimals)
- All amounts in contract use wei (smallest unit)
- Gas fees paid in SepoliaETH
- FHE operations consume more gas than cleartext operations

## 🔮 Future Enhancements

### Phase 2 Features
- Full FHE encrypted arithmetic (comparisons, conditionals)
- AI-powered claim validation integration
- Oracle integration for asset valuation
- Automated policy renewal
- Multi-token support (stablecoins)

### FHEVM Advanced Features
- Encrypted policy comparisons on-chain
- FHE-based automated claim approval logic
- Multi-party computation for fairness
- Confidential surplus calculations



## 📚 FHEVM Integration Guide

### Overview
The `FHETakafulInsurance` contract demonstrates privacy-preserving insurance using Zama's FHEVM. Claim amounts are encrypted on-chain using homomorphic encryption.

### Key Differences from Original
| Feature | Original | FHE Version |
|---------|----------|-------------|
| Claim amounts | Stored as `uint256` | Stored as `euint32` (encrypted) |
| Privacy | Public on-chain | Encrypted, decryptable only with permission |
| Approval | Direct on-chain logic | Admin workflow after off-chain decryption |
| Permissions | Role-based only | Role + FHE allow/deny grants |

### Off-Chain Decryption Flow
1. User submits claim with encrypted amount (via Zama relayer)
2. Approver reviews and approves in `processClaim`
3. Off-chain authorized party decrypts the amount using granted permission
4. Admin calls `setClaimPayout(claimId, decryptedAmount)` with clear value
5. Admin calls `payClaim(claimId)` to execute transfer

### Using the Relayer SDK
To generate `externalEuint32` and `inputProof`:
```typescript
// Pseudo-code (requires Zama relayer setup)
const relayer = new Relayer(RELAYER_URL);
const encryptedClaim = await relayer.encrypt(claimAmount, {
  sender: userAddress,
  contract: fheContractAddress
});
const proof = await relayer.generateProof(encryptedClaim);
// Submit to submitClaim(policyId, encryptedClaim, proof, reason, hash)
```

## 📄 License

MIT License - see LICENSE file for details.

---
