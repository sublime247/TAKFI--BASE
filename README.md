# Takaful Insurance Smart Contract

A Sharia-compliant insurance (Takaful) smart contract built on Base for non-life insurance coverage including vehicles, property, and business assets.

# Deployed and Verified 
Contract Address: 0x32a300274bb6304006618fb821691faac7109934
Verified: https://base-sepolia.blockscout.com/address/0x32a300274bb6304006618fb821691faac7109934#code

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
3. Base testnet account with ETH
4. Private key for deployment

### Environment Setup
Create a `.env` file with:
```env
BASE_SEPOLIA_PRIVATE_KEY=your_private_key_here
BASE_MAINNET_PRIVATE_KEY=your_mainnet_private_key_here
```

### Deploy to Base Sepolia Testnet
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Base Sepolia testnet
npx hardhat ignition deploy ./ignition/modules/TakafulInsurance.ts --network baseSepolia
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

### 4. Submit Claim
```solidity
function submitClaim(
    uint256 _policyId,
    uint256 _claimAmount,
    string calldata _reason,
    string calldata _evidenceHash  // IPFS hash of evidence
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

## 🌐 Base Integration

### Network Configuration
- **Base Sepolia Testnet**: Chain ID 84532, RPC: `https://sepolia.base.org`
- **Base Mainnet**: Chain ID 8453, RPC: `https://mainnet.base.org`

### Base Network Benefits
- **Low Transaction Costs**: Optimized L2 gas fees
- **EVM Compatible**: Full Ethereum compatibility
- **Fast Finality**: Quick transaction confirmation
- **Secure**: Built on Optimism's OP Stack

### ETH Considerations
- Native currency is ETH (18 decimals)
- All amounts in contract use wei (smallest unit)
- Gas fees paid in ETH

## 🔮 Future Enhancements

### Phase 2 Features
- AI-powered claim validation integration
- Oracle integration for asset valuation
- Automated policy renewal
- Multi-token support (stablecoins)

### Base-Specific Features
- Integration with Base ecosystem protocols
- Optimistic rollup benefits for lower costs
- Compatibility with Ethereum tooling
- Access to Base's growing DeFi ecosystem



## 📄 License

MIT License - see LICENSE file for details.

---
