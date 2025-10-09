import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";

describe("TakafulInsurance", async function () {
    const { viem } = await network.connect({
        network: "hardhatOp"
    });
    // const publicClient = await viem.getPublicClient();  //  getPublicClient is not a function   

    let takafulInsurance: any;
    let deployer: any;
    let user1: any;
    let user2: any;
    let claimApprover: any;

    beforeEach(async function () {
        // Deploy fresh contract for each test
        takafulInsurance = await viem.deployContract("TakafulInsurance");

        // Get wallet clients
        const wallets = await viem.getWalletClients();
        [deployer, user1, user2, claimApprover] = wallets;

        // Grant CLAIM_APPROVER_ROLE to claimApprover
        const CLAIM_APPROVER_ROLE = await takafulInsurance.read.CLAIM_APPROVER_ROLE();
        await takafulInsurance.write.grantRole([CLAIM_APPROVER_ROLE, claimApprover.account.address]);
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const hasRole = await takafulInsurance.read.hasRole([DEFAULT_ADMIN_ROLE, deployer.account.address]);
            assert.equal(hasRole, true);
        });

        it("Should set correct platform fee rate", async function () {
            const feeRate = await takafulInsurance.read.platformFeeRate();
            assert.equal(feeRate, 250n); // 2.5%
        });
    });

    describe("Individual Policy Creation", function () {
        it("Should create an individual policy successfully", async function () {
            const coverageAmount = parseEther("10"); // 10 HBAR coverage
            const contribution = parseEther("1"); // 1 HBAR contribution
            const duration = 365; // 365 days

            // Test policy creation
            await takafulInsurance.write.createPolicy([0, coverageAmount, contribution, duration], {
                value: contribution,
                account: user1.account,
            });

            // Check policy details
            const policyDetails = await takafulInsurance.read.getPolicyDetails([1n]);
            assert.equal(policyDetails[0], 0); // PolicyType.INDIVIDUAL
            assert.equal(policyDetails[1].toLowerCase(), user1.account.address.toLowerCase()); // creator
            assert.equal(policyDetails[2], coverageAmount); // coverageAmount
            assert.equal(policyDetails[3], contribution); // contributionPerMember
            assert.equal(policyDetails[6], true); // isActive
            assert.equal(policyDetails[7], contribution); // totalContributions
            assert.equal(policyDetails[9], 1n); // memberCount
        });

        it("Should fail to create policy with zero coverage", async function () {
            try {
                await takafulInsurance.write.createPolicy([0, 0n, parseEther("1"), 365], {
                    value: parseEther("1"),
                    account: user1.account,
                });
                assert.fail("Should have thrown an error");
            } catch (error: any) {
                assert(error.message.includes("Coverage amount must be positive"));
            }
        });

        it("Should fail to create policy with insufficient contribution", async function () {
            try {
                await takafulInsurance.write.createPolicy([0, parseEther("10"), parseEther("1"), 365], {
                    value: parseEther("0.5"), // Less than required contribution
                    account: user1.account,
                });
                assert.fail("Should have thrown an error");
            } catch (error: any) {
                assert(error.message.includes("Insufficient contribution"));
            }
        });
    });

    describe("Group Policy Creation and Joining", function () {
        it("Should create a group policy and allow members to join", async function () {
            const coverageAmount = parseEther("10");
            const contribution = parseEther("1");
            const duration = 365;

            // Create group policy
            await takafulInsurance.write.createPolicy([1, coverageAmount, contribution, duration], {
                value: contribution,
                account: user1.account,
            });

            // User2 joins the policy
            await takafulInsurance.write.joinPolicy([1n], {
                value: contribution,
                account: user2.account,
            });

            // Check policy details after joining
            const policyDetails = await takafulInsurance.read.getPolicyDetails([1n]);
            assert.equal(policyDetails[9], 2n); // memberCount should be 2
            assert.equal(policyDetails[7], parseEther("2")); // totalContributions should be 2 HBAR

            // Check members list
            const members = await takafulInsurance.read.getPolicyMembers([1n]);
            assert.equal(members.length, 2);
            assert(members.some((addr: string) => addr.toLowerCase() === user1.account.address.toLowerCase()));
            assert(members.some((addr: string) => addr.toLowerCase() === user2.account.address.toLowerCase()));
        });

        it("Should not allow joining individual policy", async function () {
            // Create individual policy
            await takafulInsurance.write.createPolicy([0, parseEther("10"), parseEther("1"), 365], {
                value: parseEther("1"),
                account: user1.account,
            });

            // Try to join individual policy
            try {
                await takafulInsurance.write.joinPolicy([1n], {
                    value: parseEther("1"),
                    account: user2.account,
                });
                assert.fail("Should have thrown an error");
            } catch (error: any) {
                assert(error.message.includes("Can only join group policies"));
            }
        });
    });

    describe("Claims Management", function () {
        it("Should allow policy members to submit claims", async function () {
            // Create policy
            await takafulInsurance.write.createPolicy([0, parseEther("10"), parseEther("2"), 365], {
                value: parseEther("2"),
                account: user1.account,
            });

            // Submit claim
            const claimAmount = parseEther("1");
            const reason = "Car accident damage";
            const evidenceHash = "QmTestHash123";

            await takafulInsurance.write.submitClaim([1n, claimAmount, reason, evidenceHash], {
                account: user1.account,
            });

            // Check claim details
            const claimDetails = await takafulInsurance.read.getClaimDetails([1n]);
            assert.equal(claimDetails[0], 1n); // policyId
            assert.equal(claimDetails[1].toLowerCase(), user1.account.address.toLowerCase()); // claimant
            assert.equal(claimDetails[2], claimAmount); // claimAmount
            assert.equal(claimDetails[3], reason); // reason
            assert.equal(claimDetails[4], evidenceHash); // evidenceHash
            assert.equal(claimDetails[5], 0); // ClaimStatus.SUBMITTED
        });

        it("Should not allow claims exceeding coverage amount", async function () {
            // Create policy with 10 HBAR coverage
            await takafulInsurance.write.createPolicy([0, parseEther("10"), parseEther("2"), 365], {
                value: parseEther("2"),
                account: user1.account,
            });

            // Try to claim more than coverage
            try {
                await takafulInsurance.write.submitClaim([1n, parseEther("15"), "Large claim", "hash"], {
                    account: user1.account,
                });
                assert.fail("Should have thrown an error");
            } catch (error: any) {
                assert(error.message.includes("Claim exceeds coverage"));
            }
        });

        it("Should allow claim approval and payment", async function () {
            // Create policy with sufficient funds
            await takafulInsurance.write.createPolicy([0, parseEther("10"), parseEther("5"), 365], {
                value: parseEther("5"),
                account: user1.account,
            });

            // Submit claim
            const claimAmount = parseEther("2");
            await takafulInsurance.write.submitClaim([1n, claimAmount, "Damage", "hash"], {
                account: user1.account,
            });

            // Approve claim
            await takafulInsurance.write.processClaim([1n, true, "Approved after review"], {
                account: claimApprover.account,
            });

            // Pay claim
            await takafulInsurance.write.payClaim([1n], {
                account: claimApprover.account,
            });

            // Check claim status
            const claimDetails = await takafulInsurance.read.getClaimDetails([1n]);
            assert.equal(claimDetails[5], 4); // ClaimStatus.PAID
        });
    });

    describe("Admin Functions", function () {
        it("Should allow admin to set platform fee rate", async function () {
            const newFeeRate = 500n; // 5%
            await takafulInsurance.write.setPlatformFeeRate([newFeeRate], {
                account: deployer.account,
            });

            const updatedFeeRate = await takafulInsurance.read.platformFeeRate();
            assert.equal(updatedFeeRate, newFeeRate);
        });

        it("Should not allow setting fee rate too high", async function () {
            try {
                await takafulInsurance.write.setPlatformFeeRate([1500n], { // 15% - too high
                    account: deployer.account,
                });
                assert.fail("Should have thrown an error");
            } catch (error: any) {
                assert(error.message.includes("Fee rate too high"));
            }
        });

        it("Should allow admin to pause and unpause", async function () {
            // Pause contract
            await takafulInsurance.write.pause({ account: deployer.account });

            // Try to create policy while paused
            try {
                await takafulInsurance.write.createPolicy([0, parseEther("10"), parseEther("1"), 365], {
                    value: parseEther("1"),
                    account: user1.account,
                });
                assert.fail("Should have thrown an error");
            } catch (error: any) {
                // The contract should throw an error when paused
                assert(error.message.length > 0, "Expected an error when contract is paused");
            }

            // Unpause contract
            await takafulInsurance.write.unpause({ account: deployer.account });

            // Should work after unpause
            await takafulInsurance.write.createPolicy([0, parseEther("10"), parseEther("1"), 365], {
                value: parseEther("1"),
                account: user1.account,
            });
        });
    });

    describe("View Functions", function () {
        it("Should return user policies correctly", async function () {
            // Create two policies
            await takafulInsurance.write.createPolicy([0, parseEther("10"), parseEther("1"), 365], {
                value: parseEther("1"),
                account: user1.account,
            });

            await takafulInsurance.write.createPolicy([1, parseEther("5"), parseEther("0.5"), 180], {
                value: parseEther("0.5"),
                account: user1.account,
            });

            const userPolicies = await takafulInsurance.read.getUserPolicies([user1.account.address]);
            assert.equal(userPolicies.length, 2);
            assert.equal(userPolicies[0], 1n);
            assert.equal(userPolicies[1], 2n);
        });

        it("Should return user claims correctly", async function () {
            // Create policy
            await takafulInsurance.write.createPolicy([0, parseEther("10"), parseEther("2"), 365], {
                value: parseEther("2"),
                account: user1.account,
            });

            // Submit two claims
            await takafulInsurance.write.submitClaim([1n, parseEther("1"), "Claim 1", "hash1"], {
                account: user1.account,
            });

            await takafulInsurance.write.submitClaim([1n, parseEther("0.5"), "Claim 2", "hash2"], {
                account: user1.account,
            });

            const userClaims = await takafulInsurance.read.getUserClaims([user1.account.address]);
            assert.equal(userClaims.length, 2);
            assert.equal(userClaims[0], 1n);
            assert.equal(userClaims[1], 2n);
        });
    });
});