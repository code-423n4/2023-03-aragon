/* MARKDOWN
### Depositing ETH to a DAO

Handles the flow of depositing the native token to an Aragon DAO.

Handles the flow of depositing the native EVM token (when in mainnet, it's ETH) to an aragonOSx DAO.
*/

import {
  Client,
  DaoDepositSteps,
  GasFeeEstimation,
  DepositParams,
  TokenType
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate the general purpose client from the aragonOSx SDK context.
const client: Client = new Client(context);

const depositParams: DepositParams = {
  daoAddressOrEns: 'my-dao.dao.eth',
  amount: BigInt(10), // amount in wei
  type: TokenType.NATIVE // "native" meaning the native token to that EVM (ETH in mainnet), otherwise "erc20" for ERC20 tokens
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.deposit(depositParams);
console.log({ avg: estimatedGas.average, max: estimatedGas.max });

// Deposit ETH to the DAO.
const steps = client.methods.deposit(depositParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoDepositSteps.DEPOSITING:
        console.log(step.txHash); // 0xb1c14a49...3e8620b0f5832d61c
        break;
      case DaoDepositSteps.DONE:
        console.log(step.amount); // 10n
        break;
    }
  } catch (err) {
    console.error({ err });
  }
}
