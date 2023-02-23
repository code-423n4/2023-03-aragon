import {
  IMultisigClient,
  IMultisigClientDecoding,
  IMultisigClientEncoding,
  IMultisigClientEstimation,
  IMultisigClientMethods,
  MultisigPluginInstallParams,
} from "./interfaces";
import { MultisigClientMethods } from "./internal/client/methods";
import { MultisigClientEncoding } from "./internal/client/encoding";
import { MultisigClientDecoding } from "./internal/client/decoding";
import { MultisigClientEstimation } from "./internal/client/estimation";
import {
  ClientCore,
  ContextPlugin,
  IPluginInstallItem,
} from "../client-common";

/**
 * Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO
 */
export class MultisigClient extends ClientCore implements IMultisigClient {
  public methods: IMultisigClientMethods;
  public encoding: IMultisigClientEncoding;
  public decoding: IMultisigClientDecoding;
  public estimation: IMultisigClientEstimation;
  constructor(context: ContextPlugin) {
    super(context);
    this.methods = new MultisigClientMethods(context);
    this.encoding = new MultisigClientEncoding(context);
    this.decoding = new MultisigClientDecoding(context);
    this.estimation = new MultisigClientEstimation(context);
  }

  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {string[]} members
     * @return {*}  {IPluginInstallItem}
     * @memberof MultisigClient
     */
    getPluginInstallItem: (
      params: MultisigPluginInstallParams,
    ): IPluginInstallItem =>
      MultisigClientEncoding.getPluginInstallItem(params),
  };
}
