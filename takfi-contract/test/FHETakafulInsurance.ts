import { expect } from "chai";
import { network } from "hardhat";
import { parseEther } from "viem";
import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";


describe("FHETakafulInsurance", async function () {
    const { viem } = await network.connect({
        network: "hardhatOp"
    });

describe("FHETakafulInsurance (partial tests)", function () {
    let FHETakafulFactory: any;
    let fhetakaful: any;
    let deployer: any;
    let alice: any;
    let bob: any;
    let claimApprover: any;

    beforeEach(async function () {
        // Deploy fresh contract for each test
        fhetakaful = await viem.deployContract("TakafulInsurance");

        // Get wallet clients
        const wallets = await viem.getWalletClients();
        [deployer, alice, bob,  claimApprover] = wallets;

        // Grant CLAIM_APPROVER_ROLE to claimApprover
        const CLAIM_APPROVER_ROLE = await fhetakaful.read.CLAIM_APPROVER_ROLE();
        await fhetakaful.write.grantRole([CLAIM_APPROVER_ROLE, claimApprover.account.address]);
    });

    it("should set admin role to deployer", async function () {
        const ADMIN_ROLE = await fhetakaful.ADMIN_ROLE();
        expect(await fhetakaful.hasRole(ADMIN_ROLE, deployer.address)).to.be.true;
    });

    it("allows creating an individual policy and returns correct details", async function () {
        // PolicyType.INDIVIDUAL === 0
        const contribution = parseEther("0.01");

        const tx = await fhetakaful.connect(alice).createPolicy(0, 1000, contribution, 30, { value: contribution });
        const receipt = await tx.wait();

        // first policy has id 1
        const details = await fhetakaful.getPolicyDetails(1);

        expect(details.creator).to.equal(alice.address);
        expect(details.coverageAmount).to.equal(1000);
        expect(details.contributionPerMember).to.equal(contribution);
        expect(details.isActive).to.equal(true);
    });

    it("allows another account to join a group policy", async function () {
        // Create a GROUP policy (1)
        const contribution = parseEther("0.01");
        await fhetakaful.connect(alice).createPolicy(1, 2000, contribution, 30, { value: contribution });

        // Bob joins
        await fhetakaful.connect(bob).joinPolicy(1, { value: contribution });

        const members = await fhetakaful.getPolicyMembers(1);
        expect(members.length).to.equal(2);
    });

    it("accepts clear contributions", async function () {
        const contribution = parseEther("0.01");
        await fhetakaful.connect(alice).createPolicy(0, 500, contribution, 7, { value: contribution });

        // Alice makes additional contribution
        await fhetakaful.connect(alice).makeContribution(1, { value: contribution });

        const contributionValue = await fhetakaful.getMemberContribution(1, alice.address);
        expect(contributionValue).to.equal(contribution * 2n);
    });

    it.skip("(FHE) submit an encrypted claim — requires Zama relayer/SDK setup", async function () {
   
    });
});
});
