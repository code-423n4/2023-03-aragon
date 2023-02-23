import { hexToBytes, InvalidAddressError } from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import {
  ClientCore,
  ContextPlugin,
  DaoAction,
  IPluginInstallItem,
} from "../../../client-common";
import {
  IMultisigClientEncoding,
  MultisigPluginInstallParams,
  UpdateAddressesParams,
  UpdateMultisigVotingSettingsParams,
} from "../../interfaces";
// @ts-ignore
// todo fix new contracts-ethers
import { Multisig__factory } from "@aragon/core-contracts-ethers";
import { MULTISIG_PLUGIN_ID } from "../constants";
import { defaultAbiCoder } from "@ethersproject/abi";

/**
 * Encoding module for the SDK Multisig Client
 */
export class MultisigClientEncoding extends ClientCore
  implements IMultisigClientEncoding {
  constructor(context: ContextPlugin) {
    super(context);
  }

  /**
   * Computes the parameters to be given when creating the DAO,
   * so that the plugin is configured
   *
   * @param {MultisigPluginInstallParams} params
   * @return {*}  {IPluginInstallItem}
   * @memberof MultisigClientEncoding
   */
  static getPluginInstallItem(
    params: MultisigPluginInstallParams,
  ): IPluginInstallItem {
    const hexBytes = defaultAbiCoder.encode(
      // members, [onlyListed, minApprovals]
      [
        "address[]",
        "tuple(bool, uint16)",
      ],
      [
        params.members,
        [
          params.votingSettings.onlyListed,
          params.votingSettings.minApprovals,
        ],
      ],
    );
    return {
      id: MULTISIG_PLUGIN_ID,
      data: hexToBytes(hexBytes),
    };
  }

  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {UpdateAddressesParams} params
   * @return {*}  {DaoAction}
   * @memberof MultisigClientEncoding
   */
  public addAddressesAction(
    params: UpdateAddressesParams,
  ): DaoAction {
    if (!isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }
    // TODO yup validation
    for (const member of params.members) {
      if (!isAddress(member)) {
        throw new InvalidAddressError();
      }
    }
    const multisigInterface = Multisig__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "addAddresses",
      [params.members],
    );
    return {
      to: params.pluginAddress,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal that adds addresses to address list
   *
   * @param {UpdateAddressesParams} params
   * @return {*}  {DaoAction}
   * @memberof MultisigClientEncoding
   */
  public removeAddressesAction(
    params: UpdateAddressesParams,
  ): DaoAction {
    if (!isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }
    // TODO yup validation
    for (const member of params.members) {
      if (!isAddress(member)) {
        throw new InvalidAddressError();
      }
    }
    const multisigInterface = Multisig__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "removeAddresses",
      [params.members],
    );
    return {
      to: params.pluginAddress,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal updates multisig settings
   *
   * @param {UpdateMultisigVotingSettingsParams} params
   * @return {*}  {DaoAction}
   * @memberof MultisigClientEncoding
   */
  public updateMultisigVotingSettings(
    params: UpdateMultisigVotingSettingsParams,
  ): DaoAction {
    if (!isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }
    const multisigInterface = Multisig__factory.createInterface();
    // get hex bytes
    const hexBytes = multisigInterface.encodeFunctionData(
      "updateMultisigSettings",
      [params.votingSettings],
    );
    return {
      to: params.pluginAddress,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
    };
  }
}
