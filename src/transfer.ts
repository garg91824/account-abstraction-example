import { config } from "dotenv"
import { IBundler, Bundler } from '@biconomy/bundler'
import { ethers } from 'ethers'
import { ChainId } from "@biconomy/core-types"
import {  BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from "@biconomy/modules";

config()

const bundler: IBundler = new Bundler({
    bundlerUrl: 'https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',     
    chainId: ChainId.POLYGON_MUMBAI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  })

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai")
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);

async function createAccount() {

    const module = await ECDSAOwnershipValidationModule.create({
      signer: wallet,
      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
    })
  
    let biconomySmartAccount = await BiconomySmartAccountV2.create({
    chainId: ChainId.POLYGON_MUMBAI,
    bundler: bundler, 
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    defaultValidationModule: module,
    activeValidationModule: module
  })
    console.log("address: ", await biconomySmartAccount.getAccountAddress())
    return biconomySmartAccount;
  }

  async function createTransaction() {
    console.log("creating account")
  
    const smartAccount = await createAccount();
    const transaction = {
      to: '0x322Af0da66D00be980C7aa006377FCaaEee3BDFD',
      data: '0x',
      value: ethers.utils.parseEther('0.015'),
    }
  
    const userOp = await smartAccount.buildUserOp([transaction])
    userOp.paymasterAndData = "0x"
    console.log(userOp)
    try{
        const userOpResponse = await smartAccount.sendUserOp(userOp)
        console.log("1")
        const transactionDetail = await userOpResponse.wait()
      
        console.log("transaction detail below")
        console.log(transactionDetail)
    } catch (error) {
        console.log("found error", error)
    }
    
  }

  createTransaction()

// First smart contract transfer - https://mumbai.polygonscan.com/tx/0xfd8577fb238121d508df57bf029eecbd96ade0fe6b39b082b05e3a85aff5d56f

// {
//   userOpHash: '0xf14e91a6d74a48ee5f9a70d5eb30ea4047ed55347cbc4f1ba71d96409486f974',
//   entryPoint: '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789',
//   sender: '0x35BA254bf74377534C6f46A3c428E1506eF98520',
//   nonce: 0,
//   success: 'true',
//   paymaster: '0x',
//   actualGasCost: 504937511445250,
//   actualGasUsed: 336625,
//   logs: [
//     {
//       transactionIndex: 19,
//       blockNumber: 40577350,
//       transactionHash: '0x766659c8591a27df428daac166ec765f08f3cb29581f5dd5f45ebf0424c4b715',
//       address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
//       topics: [Array],
//       data: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000001cb3ced00e30200000000000000000000000000000000000000000000000000000000000522f1',
//       logIndex: 115,
//       blockHash: '0xd7cf1ce2bc8e9beeae1cc710caf493e8d427befd2179c407f2931dd249b8a3b6'
//     }
//   ],
//   receipt: {
//     to: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
//     from: '0x3540B9De3C81B87D565884D4B73e3a48465744e6',
//     contractAddress: null,
//     transactionIndex: 19,
//     gasUsed: { _hex: '0x04cb3a', _isBigNumber: true },
//     logsBloom: '0x000044000000000000000000800000000000000000000000020000000100000000280000000000000802001100000000001080000000000000000200000000000000000000000000000400000001008400000000000000000001000000002040000000000a0000000000000000000800004000000000004080800000000200000000000000000000000000000000000000000200000480000000000001000000200000000000010000400000800000000000020000000000000002200000004010000000004000000001000000010000000800108000800000108042000020000040001000408000000000000000000100002000000100004000000000100000',
//     blockHash: '0xd7cf1ce2bc8e9beeae1cc710caf493e8d427befd2179c407f2931dd249b8a3b6',
//     transactionHash: '0x766659c8591a27df428daac166ec765f08f3cb29581f5dd5f45ebf0424c4b715',
//     logs: [
//       [Object], [Object],
//       [Object], [Object],
//       [Object], [Object],
//       [Object], [Object],
//       [Object], [Object]
//     ],
//     blockNumber: 40577350,
//     confirmations: 1,
//     cumulativeGasUsed: { _hex: '0x3219f5', _isBigNumber: true },
//     effectiveGasPrice: { _hex: '0x59682f22', _isBigNumber: true },
//     status: 1,
//     type: 2,
//     byzantium: true
//   }
// }



