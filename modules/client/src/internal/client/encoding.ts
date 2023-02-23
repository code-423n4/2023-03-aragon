import {
  IClientEncoding,
  IGrantPermissionParams,
  IRevokePermissionParams,
  TokenType,
  WithdrawParams,
} from "../../interfaces";
import { ClientCore, Context, DaoAction } from "../../client-common";
import { isAddress } from "@ethersproject/address";
import { DAO__factory } from "@aragon/core-contracts-ethers";
import { permissionParamsToContract } from "../utils";
import { Contract } from "@ethersproject/contracts";
import { erc20ContractAbi } from "../abi/erc20";
import { hexToBytes } from "@aragon/sdk-common";
import { toUtf8Bytes } from "@ethersproject/strings";

/**
 * Encoding module the SDK Generic Client
 */
export class ClientEncoding extends ClientCore implements IClientEncoding {
  constructor(context: Context) {
    super(context);
    Object.freeze(ClientEncoding.prototype);
    Object.freeze(this);
  }
  /**
   * Computes the payload to be given when creating a proposal that grants a permission within a DAO
   *
   * @param {string} daoAddress
   * @param {IGrantPermissionParams} params
   * @return {*}  {DaoAction}
   * @memberof ClientEncoding
   */
  public grantAction(
    daoAddress: string,
    params: IGrantPermissionParams,
  ): DaoAction {
    const signer = this.web3.getSigner();
    const { where, who } = params;
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (
      !isAddress(where) || !isAddress(who) || !isAddress(daoAddress)
    ) {
      throw new Error("Invalid address");
    }
    const daoInterface = DAO__factory.createInterface();
    const args = permissionParamsToContract(
      {
        who,
        where,
        permission: params.permission,
      },
    );
    // get hex bytes
    const hexBytes = daoInterface.encodeFunctionData("grant", args);
    return {
      to: daoAddress,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that revokes a permission within a DAO
   *
   * @param {string} daoAddress
   * @param {IRevokePermissionParams} params
   * @return {*}  {DaoAction}
   * @memberof ClientEncoding
   */
  public revokeAction(
    daoAddress: string,
    params: IRevokePermissionParams,
  ): DaoAction {
    const signer = this.web3.getSigner();
    const { where, who } = params;
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (
      !isAddress(where) || !isAddress(who) || !isAddress(daoAddress)
    ) {
      throw new Error("Invalid address");
    }
    const daoInterface = DAO__factory.createInterface();
    const args = permissionParamsToContract(
      {
        who,
        where,
        permission: params.permission,
      },
    );
    // get hex bytes
    const hexBytes = daoInterface.encodeFunctionData("revoke", args);
    return {
      to: daoAddress,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
    };
  }
  /**
   * Computes the payload to be given when creating a proposal that withdraws ether from the DAO
   *
   * @param {string} recipientAddressOrEns
   * @param {WithdrawParams} value
   * @return {*}  {Promise<DaoAction>}
   * @memberof ClientEncoding
   */
  public async withdrawAction(params: WithdrawParams): Promise<DaoAction> {
    let to = params.recipientAddressOrEns;
    if (!isAddress(params.recipientAddressOrEns)) {
      const resolvedAddress = await this.web3.getSigner()?.resolveName(
        params.recipientAddressOrEns,
      );
      if (!resolvedAddress) {
        throw new Error("invalid ens");
      }
      to = resolvedAddress;
    }

    switch (params.type) {
      case TokenType.NATIVE:
        return { to, value: params.amount, data: new Uint8Array() };
      case TokenType.ERC20:
        if (!params.tokenAddress) {
          throw new Error("Empty token contract address");
        }

        const iface = new Contract(
          params.tokenAddress,
          erc20ContractAbi,
        ).interface;
        const data = iface.encodeFunctionData("transfer", [
          params.recipientAddressOrEns,
          params.amount,
        ]);
        return {
          to: params.tokenAddress,
          value: BigInt(0),
          data: hexToBytes(data),
        };
    }
    throw new Error("Unsupported token type");
  }
  /**
   * Computes the payload to be given when creating a proposal that updates the metadata the DAO
   *
   * @param {string} daoAddressOrEns
   * @param {DaoMetadata} params
   * @return {*}  {Promise<DaoAction>}
   * @memberof ClientEncoding
   */
  public async updateDaoMetadataAction(
    daoAddressOrEns: string,
    metadataUri: string,
  ): Promise<DaoAction> {
    let address = daoAddressOrEns;
    if (!isAddress(daoAddressOrEns)) {
      const resolvedAddress = await this.web3.getSigner()?.resolveName(
        daoAddressOrEns,
      );
      if (!resolvedAddress) {
        throw new Error("Invalid ENS");
      }
      address = resolvedAddress;
    }
    // upload metadata to IPFS
    const daoInterface = DAO__factory.createInterface();
    const args = toUtf8Bytes(metadataUri);
    const hexBytes = daoInterface.encodeFunctionData("setMetadata", [args]);
    return {
      to: address,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
    };
  }
}
