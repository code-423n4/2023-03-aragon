// This file defines the interfaces of the context object holding client settings

import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
import { Client as IpfsClient } from "@aragon/sdk-ipfs";
import { GraphQLClient } from "graphql-request";

// Context input parameters

type Web3ContextParams = {
  network: Networkish;
  signer?: Signer;
  daoFactoryAddress?: string;
  daoRegistryAddress?: string;
  pluginRepoRegistryAddress?: string;
  web3Providers?: string | JsonRpcProvider | (string | JsonRpcProvider)[];
  gasFeeEstimationFactor?: number;
};
type IpfsContextParams = {
  ipfsNodes?: { url: string; headers?: Record<string, string> }[];
};
type GraphQLContextParams = {
  graphqlNodes: { url: string }[];
};

export type ContextParams = Web3ContextParams &
  IpfsContextParams &
  GraphQLContextParams;

// Context state data

type Web3ContextState = {
  network: Networkish;
  signer?: Signer;
  daoFactoryAddress?: string;
  daoRegistryAddress?: string;
  pluginRepoRegistryAddress?: string;
  web3Providers: JsonRpcProvider[];
  gasFeeEstimationFactor: number;
};
type IpfsContextState = {
  ipfs?: IpfsClient[];
};
type GraphQLContextState = {
  graphql?: GraphQLClient[];
};

export type ContextState = Web3ContextState &
  IpfsContextState &
  GraphQLContextState;

export type ContextPluginState = {};
export type ContextPluginParams = ContextParams;
