// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Takfi Insurance
 * @dev Sharia-compliant insurance (Takaful) smart contract for non-life insurance
 * Supports both individual and group policies with transparent contribution pooling,
 * claims processing, and surplus distribution
 */
contract TakafulInsurance is
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

    // Policy structure
    struct Policy {
        uint256 policyId;
        PolicyType policyType;
        address creator; // Policy creator (individual or group leader)
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
        address[] memberList; // For iteration
    }

    // Claim structure
    struct Claim {
        uint256 claimId;
        uint256 policyId;
        address claimant;
        uint256 claimAmount;
        string reason;
        string evidenceHash; // IPFS hash or similar for claim evidence
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

    event ClaimSubmitted(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed claimant,
        uint256 claimAmount,
        string reason
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

    /**
     * @dev Create a new policy (individual or group)
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

        // Add creator as first member
        newPolicy.members[msg.sender] = true;
        newPolicy.memberList.push(msg.sender);
        userPolicies[msg.sender].push(policyId);

        // Initial contribution
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

    /**
     * @dev Join an existing group policy
     */
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

        // Add member
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

    /**
     * @dev Make additional contribution to existing policy
     */
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
     * @dev Submit a claim
     */
    function submitClaim(
        uint256 _policyId,
        uint256 _claimAmount,
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
        require(_claimAmount > 0, "Claim amount must be positive");
        require(
            _claimAmount <= policy.coverageAmount,
            "Claim exceeds coverage"
        );
        require(bytes(_reason).length > 0, "Reason required");

        uint256 claimId = nextClaimId++;

        claims[claimId] = Claim({
            claimId: claimId,
            policyId: _policyId,
            claimant: msg.sender,
            claimAmount: _claimAmount,
            reason: _reason,
            evidenceHash: _evidenceHash,
            status: ClaimStatus.SUBMITTED,
            submissionDate: block.timestamp,
            approvalDate: 0,
            approver: address(0),
            rejectionReason: ""
        });

        userClaims[msg.sender].push(claimId);

        emit ClaimSubmitted(
            claimId,
            _policyId,
            msg.sender,
            _claimAmount,
            _reason
        );

        return claimId;
    }

    /**
     * @dev Approve or reject a claim (admin or group consensus)
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
            canApprove = true; // Group leader can approve
        }

        require(canApprove, "Not authorized to process claims");

        if (_approve) {
            require(
                policy.totalContributions >= claim.claimAmount,
                "Insufficient pool funds"
            );
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
     * @dev Pay approved claim
     */
    function payClaim(
        uint256 _claimId
    ) external claimExists(_claimId) nonReentrant whenNotPaused {
        Claim storage claim = claims[_claimId];
        Policy storage policy = policies[claim.policyId];

        require(claim.status == ClaimStatus.APPROVED, "Claim not approved");
        require(
            address(this).balance >= claim.claimAmount,
            "Insufficient contract balance"
        );

        claim.status = ClaimStatus.PAID;
        policy.totalClaims += claim.claimAmount;

        // Transfer funds to claimant
        (bool success, ) = payable(claim.claimant).call{
            value: claim.claimAmount
        }("");
        require(success, "Payment failed");

        emit ClaimPaid(_claimId, claim.claimant, claim.claimAmount);
    }

    /**
     * @dev Close policy and distribute surplus
     */
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

        // Calculate surplus after platform fee
        uint256 platformFee = (policy.totalContributions * platformFeeRate) /
            10000;
        uint256 availableForDistribution = policy.totalContributions -
            policy.totalClaims -
            platformFee;

        if (availableForDistribution > 0 && policy.memberCount > 0) {
            uint256 surplusPerMember = availableForDistribution /
                policy.memberCount;

            // Distribute surplus to all members
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

        // Transfer platform fee to admin
        if (platformFee > 0) {
            // Get the first admin (contract deployer)
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

    // View functions
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
            uint256 claimAmount,
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
            claim.claimAmount,
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

    // Receive function to accept HBAR
    receive() external payable {}
}
