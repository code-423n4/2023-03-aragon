import { TokenVoting__factory } from "@aragon/core-contracts-ethers";
import {
  ClientCore,
  ContextPlugin,
  GasFeeEstimation,
  ICreateProposalParams,
  IExecuteProposalParams,
  IVoteProposalParams,
} from "../../../client-common";
import { ITokenVotingClientEstimation } from "../../interfaces";
import { toUtf8Bytes } from "@ethersproject/strings";
import { NoProviderError, NoSignerError, boolArrayToBitmap } from "@aragon/sdk-common";
/**
 * Estimation module the SDK TokenVoting Client
 */
export class TokenVotingClientEstimation extends ClientCore
  implements ITokenVotingClientEstimation {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(TokenVotingClientEstimation.prototype);
    Object.freeze(this);
  }
  /**
   * Estimates the gas fee of creating a proposal on the plugin
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof TokenVotingClientEstimation
   */
  public async createProposal(
    params: ICreateProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const tokenVotingContract = TokenVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    if (
      params.failSafeActions?.length &&
      params.failSafeActions.length !== params.actions?.length
    ) {
      throw new Error(
        "Size mismatch: actions and failSafeActions should match",
      );
    }
    const allowFailureMap = boolArrayToBitmap(params.failSafeActions);

    const startTimestamp = params.startDate?.getTime() || 0;
    const endTimestamp = params.endDate?.getTime() || 0;

    const estimatedGasFee = await tokenVotingContract.estimateGas
      .createProposal(
        toUtf8Bytes(params.metadataUri),
        params.actions || [],
        allowFailureMap,
        Math.round(startTimestamp / 1000),
        Math.round(endTimestamp / 1000),
        params.creatorVote || 0,
        params.executeOnPass || false,
      );
    return this.web3.getApproximateGasFee(estimatedGasFee.toBigInt());
  }
  /**
   * Estimates the gas fee of casting a vote on a proposal
   *
   * @param {IVoteProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof TokenVotingClientEstimation
   */
  public async voteProposal(
    params: IVoteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    const tokenVotingContract = TokenVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    const estimation = await tokenVotingContract.estimateGas.vote(
      params.proposalId,
      params.vote,
      false,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }

  /**
   * Estimates the gas fee of executing a TokenVoting proposal
   *
   * @param {IExecuteProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof TokenVotingClientEstimation
   */
  public async executeProposal(
    params: IExecuteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const tokenVotingContract = TokenVoting__factory.connect(
      params.pluginAddress,
      signer,
    );
    const estimation = await tokenVotingContract.estimateGas.execute(
      params.proposalId,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }
}
