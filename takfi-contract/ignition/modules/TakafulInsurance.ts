import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TakafulInsuranceModule = buildModule("TakafulInsuranceModule", (m) => {
    // Deploy the TakafulInsurance contract
    const takafulInsurance = m.contract("TakafulInsurance", []);

    return { takafulInsurance };
});

export default TakafulInsuranceModule; 