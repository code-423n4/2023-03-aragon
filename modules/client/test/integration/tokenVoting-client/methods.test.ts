// @ts-ignore
declare const describe, it, beforeAll, afterAll, expect, test;

// mocks need to be at the top of the imports
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";

import {
  CanExecuteParams,
  Context,
  ContextPlugin,
  ExecuteProposalStep,
  ICanVoteParams,
  ICreateProposalParams,
  IExecuteProposalParams,
  IProposalQueryParams,
  IVoteProposalParams,
  ProposalCreationSteps,
  ProposalMetadata,
  ProposalSortBy,
  ProposalStatus,
  SortDirection,
  TokenType,
  TokenVotingClient,
  VoteProposalStep,
  VoteValues,
  VotingMode,
} from "../../../src";
import * as ganacheSetup from "../../helpers/ganache-setup";
import * as deployContracts from "../../helpers/deployContracts";

import { InvalidAddressOrEnsError } from "@aragon/sdk-common";
import {
  contextParamsLocalChain,
  contextParamsMainnet,
  TEST_INVALID_ADDRESS,
  TEST_NON_EXISTING_ADDRESS,
  TEST_TOKEN_VOTING_DAO_ADDRESS,
  TEST_TOKEN_VOTING_PLUGIN_ADDRESS,
  TEST_TOKEN_VOTING_PROPOSAL_ID,
  TEST_WALLET_ADDRESS,
} from "../constants";
import { Server } from "ganache";
import { buildTokenVotingDAO } from "../../helpers/build-daos";
import {
  mineBlock,
  mineBlockWithTimeOffset,
  restoreBlockTime,
} from "../../helpers/block-times";
import { JsonRpcProvider } from "@ethersproject/providers";

describe("Token Voting Client", () => {
  let server: Server;
  let deployment: deployContracts.Deployment;
  let repoAddr: string;
  let provider: JsonRpcProvider;

  beforeAll(async () => {
    server = await ganacheSetup.start();
    deployment = await deployContracts.deploy();
    contextParamsLocalChain.daoFactoryAddress = deployment.daoFactory.address;
    repoAddr = deployment.tokenVotingRepo.address;

    if (Array.isArray(contextParamsLocalChain.web3Providers)) {
      provider = new JsonRpcProvider(
        contextParamsLocalChain.web3Providers[0] as string,
      );
    } else {
      provider = new JsonRpcProvider(
        contextParamsLocalChain.web3Providers as any,
      );
    }
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    return restoreBlockTime(provider);
  });

  // Helpers
  async function buildDaos() {
    const daoEntries: Array<{ dao: string; plugin: string }> = [];
    daoEntries.push(await buildTokenVotingDAO(repoAddr, VotingMode.STANDARD));
    daoEntries.push(
      await buildTokenVotingDAO(repoAddr, VotingMode.EARLY_EXECUTION),
    );
    daoEntries.push(
      await buildTokenVotingDAO(repoAddr, VotingMode.VOTE_REPLACEMENT),
    );
    return daoEntries;
  }

  async function buildProposal(
    pluginAddress: string,
    client: TokenVotingClient,
  ) {
    // generate actions
    const action = client.encoding.updatePluginSettingsAction(pluginAddress, {
      votingMode: VotingMode.VOTE_REPLACEMENT,
      supportThreshold: 0.5,
      minParticipation: 0.5,
      minDuration: 7200,
    });

    const metadata: ProposalMetadata = {
      title: "Best Proposal",
      summary: "this is the sumnary",
      description: "This is a very long description",
      resources: [
        {
          name: "Website",
          url: "https://the.website",
        },
      ],
      media: {
        header: "https://no.media/media.jpeg",
        logo: "https://no.media/media.jpeg",
      },
    };

    const ipfsUri = await client.methods.pinMetadata(metadata);
    const endDate = new Date(Date.now() + 60 * 60 * 1000 + 10 * 1000);

    const proposalParams: ICreateProposalParams = {
      pluginAddress,
      metadataUri: ipfsUri,
      actions: [action],
      executeOnPass: false,
      endDate,
    };

    for await (const step of client.methods.createProposal(proposalParams)) {
      switch (step.key) {
        case ProposalCreationSteps.CREATING:
          expect(typeof step.txHash).toBe("string");
          expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
          break;
        case ProposalCreationSteps.DONE:
          expect(typeof step.proposalId).toBe("number");
          return step.proposalId;
        // TODO fix with new proposalId format
        // expect(step.proposalId).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
        default:
          throw new Error(
            "Unexpected proposal creation step: " +
              Object.keys(step).join(", "),
          );
      }
    }
    throw new Error();
  }

  async function voteProposal(
    pluginAddress: string,
    proposalId: number,
    client: TokenVotingClient,
    voteValue: VoteValues = VoteValues.YES,
  ) {
    const voteParams: IVoteProposalParams = {
      pluginAddress,
      proposalId,
      vote: voteValue,
    };
    for await (const step of client.methods.voteProposal(voteParams)) {
      switch (step.key) {
        case VoteProposalStep.VOTING:
          expect(typeof step.txHash).toBe("string");
          expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
          break;
        case VoteProposalStep.DONE:
          break;
        default:
          throw new Error(
            "Unexpected vote proposal step: " + Object.keys(step).join(", "),
          );
      }
    }
  }

  describe("Client instances", () => {
    describe("Proposal Creation", () => {
      it("Should create a new proposal locally", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const daoEntries = await buildDaos();

        for (const daoEntry of daoEntries) {
          const { plugin: pluginAddress } = daoEntry;
          if (!pluginAddress) {
            throw new Error("No plugin installed");
          }

          const proposalId = await buildProposal(pluginAddress, client);
          expect(typeof proposalId).toBe("number");
        }
      });
    });

    describe("Can vote", () => {
      it("Should check if an user can vote in a TokenVoting proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const daoEntries = await buildDaos();

        for (const daoEntry of daoEntries) {
          const { plugin: pluginAddress } = daoEntry;
          if (!pluginAddress) {
            throw new Error("No plugin installed");
          }

          const proposalId = await buildProposal(pluginAddress, client);
          expect(typeof proposalId).toBe("number");

          const params: ICanVoteParams = {
            address: TEST_WALLET_ADDRESS,
            proposalId,
            pluginAddress,
            vote: VoteValues.YES,
          };
          const canVote = await client.methods.canVote(params);
          expect(typeof canVote).toBe("boolean");
          expect(canVote).toBe(true);
        }
      });
    });

    describe("Vote on a proposal", () => {
      it("Should vote on a proposal locally", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const daoEntries = await buildDaos();

        for (const daoEntry of daoEntries) {
          const { plugin: pluginAddress } = daoEntry;
          if (!pluginAddress) {
            throw new Error("No plugin installed");
          }

          const proposalId = await buildProposal(pluginAddress, client);
          expect(typeof proposalId).toBe("number");

          // Vote
          await voteProposal(pluginAddress, proposalId, client);
        }
      });

      it("Should replace a vote on a proposal locally", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.VOTE_REPLACEMENT,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("number");

        // Vote
        await voteProposal(pluginAddress, proposalId, client, VoteValues.NO);
        await mineBlock(provider);
        await voteProposal(pluginAddress, proposalId, client, VoteValues.YES);
      });
    });

    describe("Can execute", () => {
      it("Should check if an user can execute a standard voting proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.STANDARD,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("number");

        const canExecuteParams: CanExecuteParams = {
          proposalId,
          pluginAddress,
        };
        let canExecute = await client.methods.canExecute(canExecuteParams);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(false);

        // now approve
        await voteProposal(pluginAddress, proposalId, client);
        // Force date past end
        await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

        canExecute = await client.methods.canExecute(canExecuteParams);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(true);
      });

      it("Should check if an user can execute an early execution proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.EARLY_EXECUTION,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("number");

        const canExecuteParams: CanExecuteParams = {
          proposalId,
          pluginAddress,
        };
        let canExecute = await client.methods.canExecute(canExecuteParams);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(false);

        // now approve
        await voteProposal(pluginAddress, proposalId, client);
        // No waiting

        canExecute = await client.methods.canExecute(canExecuteParams);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(true);
      });

      it("Should check if an user can execute a vote replacement proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.VOTE_REPLACEMENT,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("number");

        const canExecuteParams: CanExecuteParams = {
          proposalId,
          pluginAddress,
        };
        let canExecute = await client.methods.canExecute(canExecuteParams);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(false);

        // vote no
        await voteProposal(pluginAddress, proposalId, client, VoteValues.NO);

        canExecute = await client.methods.canExecute(canExecuteParams);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(false);

        // now approve
        await voteProposal(pluginAddress, proposalId, client, VoteValues.YES);

        // Force date past end
        await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

        canExecute = await client.methods.canExecute(canExecuteParams);
        expect(typeof canExecute).toBe("boolean");
        expect(canExecute).toBe(true);
      });
    });

    describe("Execute proposal", () => {
      it("Should execute a standard voting proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.STANDARD,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("number");

        // Vote
        await voteProposal(pluginAddress, proposalId, client);
        // Force date past end
        await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

        // Execute
        const executeParams: IExecuteProposalParams = {
          pluginAddress,
          proposalId,
        };
        for await (
          const step of client.methods.executeProposal(
            executeParams,
          )
        ) {
          switch (step.key) {
            case ExecuteProposalStep.EXECUTING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case ExecuteProposalStep.DONE:
              break;
            default:
              throw new Error(
                "Unexpected execute proposal step: " +
                  Object.keys(step).join(", "),
              );
          }
        }
      });

      it("Should execute an early execution proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.EARLY_EXECUTION,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("number");

        // Vote
        await voteProposal(pluginAddress, proposalId, client);
        // No waiting here

        // Execute
        const executeParams: IExecuteProposalParams = {
          pluginAddress,
          proposalId,
        };
        for await (
          const step of client.methods.executeProposal(
            executeParams,
          )
        ) {
          switch (step.key) {
            case ExecuteProposalStep.EXECUTING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case ExecuteProposalStep.DONE:
              break;
            default:
              throw new Error(
                "Unexpected execute proposal step: " +
                  Object.keys(step).join(", "),
              );
          }
        }
      });

      it("Should execute a vote replacement proposal", async () => {
        const ctx = new Context(contextParamsLocalChain);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const { plugin: pluginAddress } = await buildTokenVotingDAO(
          repoAddr,
          VotingMode.VOTE_REPLACEMENT,
        );
        if (!pluginAddress) {
          throw new Error("No plugin installed");
        }

        const proposalId = await buildProposal(pluginAddress, client);
        expect(typeof proposalId).toBe("number");

        // Vote
        await voteProposal(pluginAddress, proposalId, client, VoteValues.NO);
        await mineBlock(provider);
        await voteProposal(pluginAddress, proposalId, client, VoteValues.YES);
        // Force date past end
        await mineBlockWithTimeOffset(provider, 2 * 60 * 60);

        // Execute
        const executeParams: IExecuteProposalParams = {
          pluginAddress,
          proposalId,
        };
        for await (
          const step of client.methods.executeProposal(
            executeParams,
          )
        ) {
          switch (step.key) {
            case ExecuteProposalStep.EXECUTING:
              expect(typeof step.txHash).toBe("string");
              expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
              break;
            case ExecuteProposalStep.DONE:
              break;
            default:
              throw new Error(
                "Unexpected execute proposal step: " +
                  Object.keys(step).join(", "),
              );
          }
        }
      });
    });

    describe("Data retrieval", () => {
      it("Should get the list of members that can vote in a proposal", async () => {
        const ctx = new Context(contextParamsMainnet);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const pluginAddress = TEST_TOKEN_VOTING_PLUGIN_ADDRESS;
        const wallets = await client.methods.getMembers(pluginAddress);

        expect(Array.isArray(wallets)).toBe(true);
        // TODO
        // for some reason subgraph does not have
        // addresses here
        if (wallets.length > 0) {
          expect(wallets.length).TobeGr(0);
          expect(typeof wallets[0]).toBe("string");
          expect(wallets[0]).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
        }
      });
      it("Should fetch the given proposal", async () => {
        const ctx = new Context(contextParamsMainnet);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        mockedIPFSClient.cat.mockResolvedValueOnce(
          Buffer.from(
            JSON.stringify({
              title: "Title",
              summary: "Summary",
              description: "Description",
              resources: [
                {
                  name: "Name",
                  url: "url",
                },
              ],
            }),
          ),
        );

        const proposalId = TEST_TOKEN_VOTING_PROPOSAL_ID;
        const proposal = await client.methods.getProposal(proposalId);

        expect(typeof proposal).toBe("object");
        expect(proposal === null).toBe(false);
        if (proposal) {
          expect(proposal.id).toBe(proposalId);
          expect(typeof proposal.id).toBe("string");
          expect(proposal.id).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,}$/i);
          expect(typeof proposal.dao.address).toBe("string");
          expect(proposal.dao.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
          expect(typeof proposal.dao.name).toBe("string");
          expect(typeof proposal.creatorAddress).toBe("string");
          expect(proposal.creatorAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
          // check metadata
          expect(typeof proposal.metadata.title).toBe("string");
          expect(typeof proposal.metadata.summary).toBe("string");
          expect(typeof proposal.metadata.description).toBe("string");
          expect(Array.isArray(proposal.metadata.resources)).toBe(true);
          for (let i = 0; i < proposal.metadata.resources.length; i++) {
            const resource = proposal.metadata.resources[i];
            expect(typeof resource.name).toBe("string");
            expect(typeof resource.url).toBe("string");
          }
          if (proposal.metadata.media) {
            if (proposal.metadata.media.header) {
              expect(typeof proposal.metadata.media.header).toBe("string");
            }
            if (proposal.metadata.media.logo) {
              expect(typeof proposal.metadata.media.logo).toBe("string");
            }
          }
          expect(proposal.startDate instanceof Date).toBe(true);
          expect(proposal.endDate instanceof Date).toBe(true);
          expect(proposal.creationDate instanceof Date).toBe(true);
          expect(typeof proposal.creationBlockNumber === "number").toBe(true);
          expect(proposal.executionDate instanceof Date).toBe(true);
          expect(typeof proposal.executionBlockNumber === "number").toBe(true);
          expect(Array.isArray(proposal.actions)).toBe(true);
          // actions
          for (let i = 0; i < proposal.actions.length; i++) {
            const action = proposal.actions[i];
            expect(action.data instanceof Uint8Array).toBe(true);
            expect(typeof action.to).toBe("string");
            expect(typeof action.value).toBe("bigint");
          }
          // result
          expect(typeof proposal.result.yes).toBe("bigint");
          expect(typeof proposal.result.no).toBe("bigint");
          expect(typeof proposal.result.abstain).toBe("bigint");
          // setttings
          expect(typeof proposal.settings.duration).toBe("number");
          expect(typeof proposal.settings.minSupport).toBe("number");
          expect(typeof proposal.settings.minTurnout).toBe("number");
          expect(
            proposal.settings.minSupport >= 0 &&
              proposal.settings.minSupport <= 1,
          ).toBe(true);
          expect(
            proposal.settings.minTurnout >= 0 &&
              proposal.settings.minTurnout <= 1,
          ).toBe(true);
          // token
          if (proposal.token) {
            expect(typeof proposal.token.name).toBe("string");
            expect(typeof proposal.token.symbol).toBe("string");
            expect(typeof proposal.token.address).toBe("string");
            expect(proposal.token.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
            if (proposal.token.type === TokenType.ERC20) {
              expect(typeof proposal.token.decimals).toBe("number");
            }
          }
          expect(typeof proposal.usedVotingWeight).toBe("bigint");
          expect(typeof proposal.totalVotingWeight).toBe("bigint");
          expect(Array.isArray(proposal.votes)).toBe(true);
          for (let i = 0; i < proposal.votes.length; i++) {
            const vote = proposal.votes[i];
            expect(typeof vote.address).toBe("string");
            expect(vote.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
            if (vote.vote) {
              expect(typeof vote.vote).toBe("number");
            }
            expect(typeof vote.weight).toBe("bigint");
            expect(typeof vote.voteReplaced).toBe("boolean");
          }
          if (proposal.executionTxHash) {
            expect(proposal.executionTxHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
          }
        }
      });
      it("Should fetch the given proposal and fail because the proposal does not exist", async () => {
        const ctx = new Context(contextParamsMainnet);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const proposalId = TEST_NON_EXISTING_ADDRESS + "_0x0";
        const proposal = await client.methods.getProposal(proposalId);

        expect(proposal === null).toBe(true);
      });
      it("Should get a list of proposals filtered by the given criteria", async () => {
        const ctx = new Context(contextParamsMainnet);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);
        const limit = 5;
        const status = ProposalStatus.DEFEATED;
        const params: IProposalQueryParams = {
          limit,
          sortBy: ProposalSortBy.CREATED_AT,
          direction: SortDirection.ASC,
          status,
        };

        const defaultCatImplementation = mockedIPFSClient.cat
          .getMockImplementation();
        mockedIPFSClient.cat.mockResolvedValue(
          Buffer.from(
            JSON.stringify({
              title: "Title",
              summary: "Summary",
            }),
          ),
        );
        const proposals = await client.methods.getProposals(params);

        expect(Array.isArray(proposals)).toBe(true);
        expect(proposals.length <= limit).toBe(true);
        for (const proposal of proposals) {
          expect(typeof proposal.id).toBe("string");
          expect(proposal.id).toMatch(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,}$/i);
          expect(typeof proposal.dao.address).toBe("string");
          expect(proposal.dao.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
          expect(typeof proposal.dao.name).toBe("string");
          expect(typeof proposal.creatorAddress).toBe("string");
          expect(proposal.creatorAddress).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
          expect(typeof proposal.metadata.title).toBe("string");
          expect(typeof proposal.metadata.summary).toBe("string");
          expect(proposal.startDate instanceof Date).toBe(true);
          expect(proposal.endDate instanceof Date).toBe(true);
          expect(proposal.status).toBe(status);
          // result
          expect(typeof proposal.result.yes).toBe("bigint");
          expect(typeof proposal.result.no).toBe("bigint");
          expect(typeof proposal.result.abstain).toBe("bigint");
          // token
          if (proposal.token) {
            expect(typeof proposal.token.name).toBe("string");
            expect(typeof proposal.token.symbol).toBe("string");
            expect(typeof proposal.token.address).toBe("string");
            expect(proposal.token.address).toMatch(/^0x[A-Fa-f0-9]{40}$/i);
            if ("decimals" in proposal.token) {
              expect(typeof proposal.token.decimals).toBe("number");
            } else if ("baseUri" in proposal.token) {
              expect(typeof proposal.token.baseUri).toBe("string");
            }
          }
        }

        mockedIPFSClient.cat.mockImplementation(defaultCatImplementation);
      });
      it("Should get a list of proposals from a specific dao", async () => {
        const ctx = new Context(contextParamsMainnet);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);
        const limit = 5;
        const address = TEST_TOKEN_VOTING_DAO_ADDRESS;
        const params: IProposalQueryParams = {
          limit,
          sortBy: ProposalSortBy.CREATED_AT,
          direction: SortDirection.ASC,
          daoAddressOrEns: address,
        };
        const proposals = await client.methods.getProposals(params);

        expect(Array.isArray(proposals)).toBe(true);
        expect(proposals.length > 0 && proposals.length <= limit).toBe(true);
      });
      it("Should get a list of proposals from a dao that has no proposals", async () => {
        const ctx = new Context(contextParamsMainnet);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);
        const limit = 5;
        const address = TEST_NON_EXISTING_ADDRESS;
        const params: IProposalQueryParams = {
          limit,
          sortBy: ProposalSortBy.CREATED_AT,
          direction: SortDirection.ASC,
          daoAddressOrEns: address,
        };
        const proposals = await client.methods.getProposals(params);

        expect(Array.isArray(proposals)).toBe(true);
        expect(proposals.length === 0).toBe(true);
      });
      it("Should get a list of proposals from an invalid address", async () => {
        const ctx = new Context(contextParamsMainnet);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);
        const limit = 5;
        const address = TEST_INVALID_ADDRESS;
        const params: IProposalQueryParams = {
          limit,
          sortBy: ProposalSortBy.CREATED_AT,
          direction: SortDirection.ASC,
          daoAddressOrEns: address,
        };
        await expect(() => client.methods.getProposals(params)).rejects.toThrow(
          new InvalidAddressOrEnsError(),
        );
      });
      it("Should get the settings of a plugin given a plugin instance address", async () => {
        const ctx = new Context(contextParamsMainnet);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const pluginAddress: string = TEST_TOKEN_VOTING_PLUGIN_ADDRESS;
        const settings = await client.methods.getVotingSettings(pluginAddress);
        expect(settings === null).toBe(false);
        if (settings) {
          expect(typeof settings.minDuration).toBe("number");
          expect(typeof settings.minParticipation).toBe("number");
          expect(typeof settings.supportThreshold).toBe("number");
          expect(typeof settings.minProposerVotingPower).toBe("bigint");
          expect(settings.supportThreshold).toBeLessThanOrEqual(1);
          expect(settings.minParticipation).toBeLessThanOrEqual(1);
        }
      });
      it("Should get the token details of a plugin given a plugin instance address", async () => {
        const ctx = new Context(contextParamsMainnet);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const pluginAddress: string = TEST_TOKEN_VOTING_PLUGIN_ADDRESS;
        const token = await client.methods.getToken(pluginAddress);
        expect(typeof token?.address).toBe("string");
        expect(typeof token?.symbol).toBe("string");
        expect(typeof token?.name).toBe("string");
      });
      it("Should return null token details for nonexistent plugin addresses", async () => {
        const ctx = new Context(contextParamsMainnet);
        const ctxPlugin = ContextPlugin.fromContext(ctx);
        const client = new TokenVotingClient(ctxPlugin);

        const pluginAddress: string = TEST_NON_EXISTING_ADDRESS;
        const token = await client.methods.getToken(pluginAddress);
        expect(token).toBe(null);
      });
    });
  });
});
