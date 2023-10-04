

// https://mumbai.polygonscan.com/tx/0x766659c8591a27df428daac166ec765f08f3cb29581f5dd5f45ebf0424c4b715
// 0x5Ff40197C83C3A2705ba912333Cf1a37BA249eB7

// bundler beneficiary address- 0x3540b9de3c81b87d565884d4b73e3a48465744e6
// entry point contract- 0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789
// smart contract wallet - 0x35ba254bf74377534c6f46a3c428e1506ef98520
// toAddress - 0x322Af0da66D00be980C7aa006377FCaaEee3BDFD
// factory - 0x000000a56Aaca3e9a4C479ea6b6CD0DbcB6634F5 


// factory -> smart contract wallet
// smart contract wallet -> entry point contract
// smart contract wallet -> toAddress
// entry point contract -> bundler





import { ethers } from "ethers";
// import chalk from "chalk";

import {
    BiconomySmartAccountV2,
    DEFAULT_ENTRYPOINT_ADDRESS,
  } from "@biconomy/account";
  import { Bundler } from "@biconomy/bundler";
  import { BiconomyPaymaster } from "@biconomy/paymaster";
import {
  IHybridPaymaster,
  PaymasterMode,
  SponsorUserOperationDto,
} from "@biconomy/paymaster";
import config from "./config.json";
import { ECDSAOwnershipValidationModule, MultiChainValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE, DEFAULT_MULTICHAIN_MODULE, DEFAULT_SESSION_KEY_MANAGER_MODULE  } from "@biconomy/modules";

const mintNft = async () => {

  // ------------------------STEP 1: Initialise Biconomy Smart Account SDK--------------------------------//  

  // get EOA address from wallet provider
  let provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  let signer = new ethers.Wallet(config.privateKey, provider);
  const eoa = await signer.getAddress();
  console.log(`EOA address: ${eoa}`);

  // create bundler and paymaster instances
  const bundler = new Bundler({
    bundlerUrl: config.bundlerUrl,
    chainId: config.chainId,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

  const paymaster = new BiconomyPaymaster({
    paymasterUrl: config.biconomyPaymasterUrl
  });

  const ecdsaModule = await ECDSAOwnershipValidationModule.create({
    signer: signer,
    moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
  })

  // Biconomy smart account config
  // Note that paymaster and bundler are optional. You can choose to create new instances of this later and make account API use 
  const biconomySmartAccountConfig = {
    signer: signer,
    chainId: config.chainId,
    rpcUrl: config.rpcUrl,
    paymaster: paymaster, 
    bundler: bundler, 
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    defaultValidationModule: ecdsaModule,
    activeValidationModule: ecdsaModule
  };

  // create biconomy smart account instance
  const biconomySmartAccount = await BiconomySmartAccountV2.create(biconomySmartAccountConfig);

  
  



  // ------------------------STEP 2: Build Partial User op from your user Transaction/s Request --------------------------------//

  
  // mint NFT
  // Please note that for sponsorship, policies have to be added on the Biconomy dashboard https://dashboard.biconomy.io/
  // in this case it will be whitelisting NFT contract and method safeMint()

  // 1. for native token transfer no policy is required. you may add a webhook to have custom control over this
  // 2. If no policies are added every transaction will be sponsored by your paymaster
  // 3. If you add policies, then only transactions that match the policy will be sponsored by your paymaster

  // generate mintNft data
  const nftInterface = new ethers.utils.Interface([
    "function safeMint(address _to)",
  ]);


  const scwAddress = await biconomySmartAccount.getAccountAddress();

  // Here we are minting NFT to smart account address itself
  const data = nftInterface.encodeFunctionData("safeMint", [scwAddress]);

  const nftAddress = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e"; // Todo // use from config
  const transaction = {
    to: nftAddress,
    data: data,
  };

  // build partial userOp
  let partialUserOp = await biconomySmartAccount.buildUserOp([transaction]);


  // ------------------------STEP 3: Get Paymaster and Data from Biconomy Paymaster --------------------------------//


  const biconomyPaymaster =
    biconomySmartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

  // Here it is meant to act as Sponsorship/Verifying paymaster hence we send mode: PaymasterMode.SPONSORED which is must  
  let paymasterServiceData: SponsorUserOperationDto = {
        mode: PaymasterMode.SPONSORED,
        smartAccountInfo: {
          name: 'BICONOMY',
          version: '2.0.0'
        },
        // optional params...
        calculateGasLimits: true
    };
    console.log("ff", paymasterServiceData);
  try {
    const paymasterAndDataResponse =
      await biconomyPaymaster.getPaymasterAndData(
        partialUserOp,                                                                                  
        paymasterServiceData
      );
      partialUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

      if (
        paymasterAndDataResponse.callGasLimit &&
        paymasterAndDataResponse.verificationGasLimit &&
        paymasterAndDataResponse.preVerificationGas
      ) {
  
        // Returned gas limits must be replaced in your op as you update paymasterAndData.
        // Because these are the limits paymaster service signed on to generate paymasterAndData
        // If you receive AA34 error check here..   
  
        partialUserOp.callGasLimit = paymasterAndDataResponse.callGasLimit;
        partialUserOp.verificationGasLimit =
        paymasterAndDataResponse.verificationGasLimit;
        partialUserOp.preVerificationGas =
        paymasterAndDataResponse.preVerificationGas;
      }
  } catch (e) {
    console.log("error received ", e);
  }

  
  // ------------------------STEP 4: Sign the UserOp and send to the Bundler--------------------------------//

  console.log(`userOp: ${JSON.stringify(partialUserOp, null, "\t")}`);

  // Below function gets the signature from the user (signer provided in Biconomy Smart Account) 
  // and also send the full op to attached bundler instance

  try {
  const userOpResponse = await biconomySmartAccount.sendUserOp(partialUserOp);
  console.log(`userOp Hash: ${userOpResponse.userOpHash}`);
  const transactionDetails = await userOpResponse.wait();
  console.log(
   
      `transactionDetails: ${JSON.stringify(transactionDetails, null, "\t")}`
    
  );
  } catch (e) {
    console.log("error received ", e);
  }

};

mintNft();

// 0.082122899005396027
// 0.082122899005396027

// 0.008874123977107188

// 0.00024431100488622
// 0.008592654971477808
// 0.008592654971477808

// sponsored transaction
//https://mumbai.polygonscan.com/tx/0xe3efaaea364dbd1d77bd980b5b68b2ea640b82ed1c0f9f499bb8c20c1d6c7728​
// central entry point (0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789) is keeping a track of paymaster (0x00000f79b7faf42eebadba19acc07cd08af44789) funds 
// which internally keeps a balance for each paymaster Id  (0x093683668054399db77a7222ca3688a8c393c940)
 
// ERC20
// bundler pays for gas
// scw sends to paymaster
// paymaster sends native token to entrypoint
// entry point sends to bundler
//

0.04957314
0.000426855590477913
