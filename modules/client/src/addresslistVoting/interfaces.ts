// This file contains the definitions of the AddressList DAO client

import {
  CanExecuteParams,
  ContractVotingSettings,
  DaoAction,
  ExecuteProposalStepValue,
  GasFeeEstimation,
  ICanVoteParams,
  IClientCore,
  ICreateProposalParams,
  IExecuteProposalParams,
  IInterfaceParams,
  IProposalQueryParams,
  IProposalSettings,
  IVoteProposalParams,
  ProposalBase,
  ProposalCreationStepValue,
  ProposalListItemBase,
  ProposalMetadata,
  SubgraphAction,
  SubgraphProposalBase,
  SubgraphVoterListItemBase,
  VoteProposalStepValue,
  VoteValues,
  VotingMode,
  VotingSettings,
} from "../client-common";

// Address List
export interface IAddresslistVotingClientMethods extends IClientCore {
  createProposal: (
    params: ICreateProposalParams,
  ) => AsyncGenerator<ProposalCreationStepValue>;
  pinMetadata: (params: ProposalMetadata) => Promise<string>;
  voteProposal: (
    params: IVoteProposalParams,
  ) => AsyncGenerator<VoteProposalStepValue>;
  executeProposal: (
    params: IExecuteProposalParams,
  ) => AsyncGenerator<ExecuteProposalStepValue>;
  canVote: (params: ICanVoteParams) => Promise<boolean>;
  canExecute: (params: CanExecuteParams) => Promise<boolean>;
  getMembers: (addressOrEns: string) => Promise<string[]>;
  getProposal: (
    propoosalId: string,
  ) => Promise<AddresslistVotingProposal | null>;
  getProposals: (
    params: IProposalQueryParams,
  ) => Promise<AddresslistVotingProposalListItem[]>;
  getVotingSettings: (pluginAddress: string) => Promise<VotingSettings | null>;
}

export interface IAddresslistVotingClientEncoding extends IClientCore {
  updatePluginSettingsAction: (
    pluginAddress: string,
    params: VotingSettings,
  ) => DaoAction;
  addMembersAction: (
    pluginAddress: string,
    members: string[],
  ) => DaoAction;
  removeMembersAction: (
    pluginAddress: string,
    members: string[],
  ) => DaoAction;
}
export interface IAddresslistVotingClientDecoding extends IClientCore {
  updatePluginSettingsAction: (data: Uint8Array) => VotingSettings;
  addMembersAction: (data: Uint8Array) => string[];
  removeMembersAction: (data: Uint8Array) => string[];
  findInterface: (data: Uint8Array) => IInterfaceParams | null;
}
export interface IAddresslistVotingClientEstimation extends IClientCore {
  createProposal: (
    params: ICreateProposalParams,
  ) => Promise<GasFeeEstimation>;
  voteProposal: (params: IVoteProposalParams) => Promise<GasFeeEstimation>;
  executeProposal: (
    params: IExecuteProposalParams,
  ) => Promise<GasFeeEstimation>;
}
/** Defines the shape of the AddressList client class */
export interface IAddresslistVotingClient {
  methods: IAddresslistVotingClientMethods;
  encoding: IAddresslistVotingClientEncoding;
  decoding: IAddresslistVotingClientDecoding;
  estimation: IAddresslistVotingClientEstimation;
}

export type AddresslistVotingProposal = ProposalBase & {
  result: AddresslistVotingProposalResult;
  settings: IProposalSettings;
  votes: Array<{ address: string; vote: VoteValues, voteReplaced: boolean }>;
  totalVotingWeight: number;
  creationBlockNumber: number;
  executionDate: Date;
  executionBlockNumber: number;
  executionTxHash: string;
};

export type AddresslistVotingProposalListItem = ProposalListItemBase & {
  result: AddresslistVotingProposalResult;
};
export type AddresslistVotingProposalResult = {
  yes: number;
  no: number;
  abstain: number;
};

export type SubgraphAddresslistVotingVoterListItem = SubgraphVoterListItemBase;

export type SubgraphAddresslistVotingProposalListItem = SubgraphProposalBase;
export type SubgraphAddresslistVotingProposal = SubgraphProposalBase & {
  createdAt: string;
  actions: SubgraphAction[];
  supportThreshold: string;
  minVotingPower: string;
  voters: SubgraphAddresslistVotingVoterListItem[];
  totalVotingPower: string;
  votingMode: VotingMode;
  creationBlockNumber: string;
  executionDate: string;
  executionBlockNumber: string;
  executionTxHash: string;
};

export type ContractAddresslistVotingInitParams = [
  ContractVotingSettings,
  string[], // addresses
];

export type IAddresslistVotingPluginInstall = {
  addresses: string[];
  votingSettings: VotingSettings;
};
