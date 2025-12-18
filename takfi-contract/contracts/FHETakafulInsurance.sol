// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title FHETakaful Insurance
 * @dev A Takaful insurance contract adapted to store encrypted claim amounts
 * and  integration with Zama's FHEVM. This contract is a safe,
 * separate example which keeps the original cleartext payment flow but stores
 * sensitive claim amounts encrypted on-chain. Off-chain decryption is expected
 * for producing payout values that administrators can use to execute payments.
 */
contract FHETakafulInsurance is
    ZamaEthereumConfig,
    AccessControlEnumerable,
    ReentrancyGuard,
    Pausable
{
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CLAIM_APPROVER_ROLE =
        keccak256("CLAIM_APPROVER_ROLE");

    // Policy types
    enum PolicyType {
        INDIVIDUAL,
        GROUP
    }

    // Claim status
    enum ClaimStatus {
        SUBMITTED,
        UNDER_REVIEW,
        APPROVED,
        REJECTED,
        PAID
    }

    // Policy structure (same as original, except unchanged types)
    struct Policy {
        uint256 policyId;
        PolicyType policyType;
        address creator;
        uint256 coverageAmount;
        uint256 contributionPerMember;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        uint256 totalContributions;
        uint256 totalClaims;
        uint256 memberCount;
        mapping(address => bool) members;
        mapping(address => uint256) memberContributions;
        address[] memberList;
    }

    // Claim structure: encrypted claim amount (euint32) + clear payoutAmount set by admin
    struct Claim {
        uint256 claimId;
        uint256 policyId;
        address claimant;
        euint32 encryptedClaimAmount; // encrypted value stored on-chain
        uint256 payoutAmount; // clear amount set by admin after off-chain decryption
        string reason;
        string evidenceHash;
        ClaimStatus status;
        uint256 submissionDate;
        uint256 approvalDate;
        address approver;
        string rejectionReason;
    }

    // State variables
    uint256 private nextPolicyId = 1;
    uint256 private nextClaimId = 1;

    mapping(uint256 => Policy) public policies;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) public userPolicies;
    mapping(address => uint256[]) public userClaims;

    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeRate = 250; // 2.5%
    uint256 public constant MAX_FEE_RATE = 1000; // 10% maximum

    // Events
    event PolicyCreated(
        uint256 indexed policyId,
        PolicyType policyType,
        address indexed creator,
        uint256 coverageAmount,
        uint256 contributionPerMember
    );

    event MemberJoined(
        uint256 indexed policyId,
        address indexed member,
        uint256 contribution
    );

    event ContributionMade(
        uint256 indexed policyId,
        address indexed contributor,
        uint256 amount,
        uint256 timestamp
    );

    // Emitted when an encrypted claim is stored (amount is encrypted on-chain)
    event ClaimSubmittedEncrypted(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed claimant
    );

    event ClaimStatusUpdated(
        uint256 indexed claimId,
        ClaimStatus status,
        address indexed approver,
        string reason
    );

    event ClaimPaid(
        uint256 indexed claimId,
        address indexed claimant,
        uint256 amount
    );

    event SurplusDistributed(
        uint256 indexed policyId,
        uint256 totalSurplus,
        uint256 memberCount
    );

    event PolicyClosed(
        uint256 indexed policyId,
        uint256 totalContributions,
        uint256 totalClaims,
        uint256 surplus
    );

    // Modifiers
    modifier onlyPolicyMember(uint256 _policyId) {
        require(policies[_policyId].members[msg.sender], "Not a policy member");
        _;
    }

    modifier onlyPolicyCreator(uint256 _policyId) {
        require(
            policies[_policyId].creator == msg.sender,
            "Not policy creator"
        );
        _;
    }

    modifier policyExists(uint256 _policyId) {
        require(
            _policyId > 0 && _policyId < nextPolicyId,
            "Policy does not exist"
        );
        _;
    }

    modifier claimExists(uint256 _claimId) {
        require(_claimId > 0 && _claimId < nextClaimId, "Claim does not exist");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(CLAIM_APPROVER_ROLE, msg.sender);
    }

    /*
      Policy and contribution functions - unchanged from the original contract
      (omitted detailed comments to keep the example concise)
    */

    function createPolicy(
        PolicyType _policyType,
        uint256 _coverageAmount,
        uint256 _contributionPerMember,
        uint256 _durationInDays
    ) external payable whenNotPaused returns (uint256) {
        require(_coverageAmount > 0, "Coverage amount must be positive");
        require(_contributionPerMember > 0, "Contribution must be positive");
        require(_durationInDays > 0, "Duration must be positive");

        uint256 policyId = nextPolicyId++;
        Policy storage newPolicy = policies[policyId];
        newPolicy.policyId = policyId;
        newPolicy.policyType = _policyType;
        newPolicy.creator = msg.sender;
        newPolicy.coverageAmount = _coverageAmount;
        newPolicy.contributionPerMember = _contributionPerMember;
        newPolicy.startDate = block.timestamp;
        newPolicy.endDate = block.timestamp + (_durationInDays * 1 days);
        newPolicy.isActive = true;
        newPolicy.memberCount = 1;

        newPolicy.members[msg.sender] = true;
        newPolicy.memberList.push(msg.sender);
        userPolicies[msg.sender].push(policyId);

        require(
            msg.value >= _contributionPerMember,
            "Insufficient contribution"
        );
        newPolicy.memberContributions[msg.sender] = msg.value;
        newPolicy.totalContributions = msg.value;

        emit PolicyCreated(
            policyId,
            _policyType,
            msg.sender,
            _coverageAmount,
            _contributionPerMember
        );
        emit ContributionMade(policyId, msg.sender, msg.value, block.timestamp);

        return policyId;
    }

    function joinPolicy(
        uint256 _policyId
    ) external payable policyExists(_policyId) whenNotPaused {
        Policy storage policy = policies[_policyId];

        require(policy.isActive, "Policy is not active");
        require(
            policy.policyType == PolicyType.GROUP,
            "Can only join group policies"
        );
        require(!policy.members[msg.sender], "Already a member");
        require(block.timestamp < policy.endDate, "Policy has expired");
        require(
            msg.value >= policy.contributionPerMember,
            "Insufficient contribution"
        );

        policy.members[msg.sender] = true;
        policy.memberList.push(msg.sender);
        policy.memberContributions[msg.sender] = msg.value;
        policy.totalContributions += msg.value;
        policy.memberCount++;

        userPolicies[msg.sender].push(_policyId);

        emit MemberJoined(_policyId, msg.sender, msg.value);
        emit ContributionMade(
            _policyId,
            msg.sender,
            msg.value,
            block.timestamp
        );
    }

    function makeContribution(
        uint256 _policyId
    )
        external
        payable
        policyExists(_policyId)
        onlyPolicyMember(_policyId)
        whenNotPaused
    {
        Policy storage policy = policies[_policyId];

        require(policy.isActive, "Policy is not active");
        require(block.timestamp < policy.endDate, "Policy has expired");
        require(msg.value > 0, "Contribution must be positive");

        policy.memberContributions[msg.sender] += msg.value;
        policy.totalContributions += msg.value;

        emit ContributionMade(
            _policyId,
            msg.sender,
            msg.value,
            block.timestamp
        );
    }

    /**
     * @dev Submit a claim with an encrypted claim amount.
     * The encrypted amount is submitted as an `externalEuint32` along with
     * a ZK proof (`inputProof`) which is validated via `FHE.fromExternal`.
     *
     * NOTE: This function uses `euint32` to match the Zama docs example. For real
     * monetary values you should verify supported encrypted widths or scale/split
     * the value appropriately. Actual payout requires an admin to set the
     * clear `payoutAmount` after off-chain decryption by an authorized party.
     */
    function submitClaim(
        uint256 _policyId,
        externalEuint32 inputEuint32,
        bytes calldata inputProof,
        string calldata _reason,
        string calldata _evidenceHash
    )
        external
        policyExists(_policyId)
        onlyPolicyMember(_policyId)
        whenNotPaused
        returns (uint256)
    {
        Policy storage policy = policies[_policyId];

        require(policy.isActive, "Policy is not active");
        require(bytes(_reason).length > 0, "Reason required");

        uint256 claimId = nextClaimId++;

        // Convert external encrypted input to on-chain euint32 and store it
        euint32 evalue = FHE.fromExternal(inputEuint32, inputProof);

        Claim storage newClaim = claims[claimId];
        newClaim.claimId = claimId;
        newClaim.policyId = _policyId;
        newClaim.claimant = msg.sender;
        newClaim.encryptedClaimAmount = evalue;
        newClaim.payoutAmount = 0; // must be set by admin after off-chain decryption
        newClaim.reason = _reason;
        newClaim.evidenceHash = _evidenceHash;
        newClaim.status = ClaimStatus.SUBMITTED;
        newClaim.submissionDate = block.timestamp;
        newClaim.approvalDate = 0;
        newClaim.approver = address(0);
        newClaim.rejectionReason = "";

        userClaims[msg.sender].push(claimId);

        // Grant permission so the contract and claimant can decrypt the value off-chain
        FHE.allowThis(newClaim.encryptedClaimAmount);
        FHE.allow(newClaim.encryptedClaimAmount, msg.sender);

        emit ClaimSubmittedEncrypted(claimId, _policyId, msg.sender);

        return claimId;
    }

    /**
     * @dev Approve or reject a claim. This does not automatically pay the claim.
     * once submitted after approval, an off-chain authorized decryptor should
     * obtain the clear amount and an admin should call `setClaimPayout` to specify
     * the payout amount which can then be paid via `payClaim`.
     */
    function processClaim(
        uint256 _claimId,
        bool _approve,
        string calldata _reason
    ) external claimExists(_claimId) whenNotPaused {
        Claim storage claim = claims[_claimId];
        Policy storage policy = policies[claim.policyId];

        require(
            claim.status == ClaimStatus.SUBMITTED ||
                claim.status == ClaimStatus.UNDER_REVIEW,
            "Claim already processed"
        );

        // Check authorization
        bool canApprove = false;
        if (
            hasRole(CLAIM_APPROVER_ROLE, msg.sender) ||
            hasRole(ADMIN_ROLE, msg.sender)
        ) {
            canApprove = true;
        } else if (
            policy.policyType == PolicyType.GROUP &&
            policy.creator == msg.sender
        ) {
            canApprove = true;
        }

        require(canApprove, "Not authorized to process claims");

        if (_approve) {
            // NOTE: We cannot compare encrypted claim amounts with clear totals on-chain.
            // In production, off-chain logic should verify funds and decrypted values.
            claim.status = ClaimStatus.APPROVED;
        } else {
            claim.status = ClaimStatus.REJECTED;
            claim.rejectionReason = _reason;
        }

        claim.approvalDate = block.timestamp;
        claim.approver = msg.sender;

        emit ClaimStatusUpdated(_claimId, claim.status, msg.sender, _reason);
    }

    /**
     * @dev Admin sets the clear payout amount for an approved claim.
     * The clear amount should come from an off-chain authorized decryptor.
     */
    function setClaimPayout(
        uint256 _claimId,
        uint256 _payoutAmount
    ) external onlyRole(ADMIN_ROLE) claimExists(_claimId) {
        Claim storage claim = claims[_claimId];
        require(claim.status == ClaimStatus.APPROVED, "Claim not approved");
        claim.payoutAmount = _payoutAmount;
    }

    /**
     * @dev Pay approved claim using the admin-set `payoutAmount`.
     */
    function payClaim(
        uint256 _claimId
    ) external claimExists(_claimId) nonReentrant whenNotPaused {
        Claim storage claim = claims[_claimId];
        Policy storage policy = policies[claim.policyId];

        require(claim.status == ClaimStatus.APPROVED, "Claim not approved");
        require(claim.payoutAmount > 0, "Payout not set");
        require(
            address(this).balance >= claim.payoutAmount,
            "Insufficient contract balance"
        );

        claim.status = ClaimStatus.PAID;
        policy.totalClaims += claim.payoutAmount;

        (bool success, ) = payable(claim.claimant).call{
            value: claim.payoutAmount
        }("");
        require(success, "Payment failed");

        emit ClaimPaid(_claimId, claim.claimant, claim.payoutAmount);
    }

    // The rest of the contract (closePolicy, view functions, admin functions) can remain
    // largely the same as the original implementation. For brevity, we reuse the
    // same logic (omitting unchanged helper functions).

    function closePolicy(
        uint256 _policyId
    ) external policyExists(_policyId) nonReentrant whenNotPaused {
        Policy storage policy = policies[_policyId];

        require(policy.isActive, "Policy already closed");
        require(
            block.timestamp >= policy.endDate ||
                hasRole(ADMIN_ROLE, msg.sender) ||
                policy.creator == msg.sender,
            "Policy not ready to close"
        );

        policy.isActive = false;

        uint256 platformFee = (policy.totalContributions * platformFeeRate) /
            10000;
        uint256 availableForDistribution = policy.totalContributions -
            policy.totalClaims -
            platformFee;

        if (availableForDistribution > 0 && policy.memberCount > 0) {
            uint256 surplusPerMember = availableForDistribution /
                policy.memberCount;

            for (uint256 i = 0; i < policy.memberList.length; i++) {
                address member = policy.memberList[i];
                if (surplusPerMember > 0) {
                    (bool success, ) = payable(member).call{
                        value: surplusPerMember
                    }("");
                    require(success, "Surplus distribution failed");
                }
            }

            emit SurplusDistributed(
                _policyId,
                availableForDistribution,
                policy.memberCount
            );
        }

        if (platformFee > 0) {
            address adminAddress = address(0);
            uint256 adminCount = getRoleMemberCount(ADMIN_ROLE);
            if (adminCount > 0) {
                adminAddress = getRoleMember(ADMIN_ROLE, 0);
            } else {
                adminAddress = getRoleMember(DEFAULT_ADMIN_ROLE, 0);
            }

            (bool success, ) = payable(adminAddress).call{value: platformFee}(
                ""
            );
            require(success, "Platform fee transfer failed");
        }

        emit PolicyClosed(
            _policyId,
            policy.totalContributions,
            policy.totalClaims,
            availableForDistribution
        );
    }

    // View helpers (partial set) -------------------------------------------------
    function getPolicyDetails(
        uint256 _policyId
    )
        external
        view
        policyExists(_policyId)
        returns (
            PolicyType policyType,
            address creator,
            uint256 coverageAmount,
            uint256 contributionPerMember,
            uint256 startDate,
            uint256 endDate,
            bool isActive,
            uint256 totalContributions,
            uint256 totalClaims,
            uint256 memberCount
        )
    {
        Policy storage policy = policies[_policyId];
        return (
            policy.policyType,
            policy.creator,
            policy.coverageAmount,
            policy.contributionPerMember,
            policy.startDate,
            policy.endDate,
            policy.isActive,
            policy.totalContributions,
            policy.totalClaims,
            policy.memberCount
        );
    }

    function getPolicyMembers(
        uint256 _policyId
    ) external view policyExists(_policyId) returns (address[] memory) {
        return policies[_policyId].memberList;
    }

    function getMemberContribution(
        uint256 _policyId,
        address _member
    ) external view policyExists(_policyId) returns (uint256) {
        return policies[_policyId].memberContributions[_member];
    }

    function getUserPolicies(
        address _user
    ) external view returns (uint256[] memory) {
        return userPolicies[_user];
    }

    function getUserClaims(
        address _user
    ) external view returns (uint256[] memory) {
        return userClaims[_user];
    }

    function getClaimDetails(
        uint256 _claimId
    )
        external
        view
        claimExists(_claimId)
        returns (
            uint256 policyId,
            address claimant,
            // Note: encryptedClaimAmount cannot be returned as a clear number here
            euint32 encryptedAmount,
            uint256 payoutAmount,
            string memory reason,
            string memory evidenceHash,
            ClaimStatus status,
            uint256 submissionDate,
            uint256 approvalDate,
            address approver,
            string memory rejectionReason
        )
    {
        Claim storage claim = claims[_claimId];
        return (
            claim.policyId,
            claim.claimant,
            claim.encryptedClaimAmount,
            claim.payoutAmount,
            claim.reason,
            claim.evidenceHash,
            claim.status,
            claim.submissionDate,
            claim.approvalDate,
            claim.approver,
            claim.rejectionReason
        );
    }

    // Admin functions
    function setPlatformFeeRate(
        uint256 _feeRate
    ) external onlyRole(ADMIN_ROLE) {
        require(_feeRate <= MAX_FEE_RATE, "Fee rate too high");
        platformFeeRate = _feeRate;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // Receive function
    receive() external payable {}
}
