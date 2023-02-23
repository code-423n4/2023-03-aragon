/* MARKDOWN
### Get the proposal by proposalId (Addresslist)

Retrieves a proposal created using the AddresslistVoting plugin.
*/

import {
  AddresslistVotingProposal,
  AddresslistVotingClient,
  ContextPlugin
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiates a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates an AddresslistVoting client.
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const proposalId = "0x12345...";

const addresslistVotingProposal: AddresslistVotingProposal | null = await addresslistVotingClient.methods.getProposal(proposalId);
console.log({ addresslistVotingProposal });

/* MARKDOWN
Returns:

```json
{
  id: "0x12345...",
  dao: {
    address: "0x1234567890123456789012345678901234567890",
    name: "Cool DAO"
  };
  creatorAddress: "0x1234567890123456789012345678901234567890",
  metadata: {
    title: "Test Proposal",
    summary: "test proposal summary",
    description: "this is a long description",
    resources: [
      {
        url: "https://dicord.com/...",
        name: "Discord"
      },
      {
        url: "https://docs.com/...",
        name: "Document"
      }
    ],
    media: {
      header: "https://.../image.jpeg",
      logo: "https://.../image.jpeg"
    }
  };
  startDate: <Date>,
  endDate: <Date>,
  creationDate: <Date>,
  creationBlockNumber: 812345,
  executionDate: <Date>,
  executionBlockNumber: 812345,
  actions: [
    {
      to: "0x12345..."
      value: 10n
      data: [12,13,154...]
    }
  ],
  status: "Executed",
  result {
    yes: 1,
    no: 1,
    abstain: 0
  }
  settings: {
    minTurnout: 0.5,
    minSupport: 0.25,
    minDuration: 7200
  },
  votes: [
    {
      address: "0x123456789123456789123456789123456789",
      vote: 2, // VoteValues.YES
    },
    {
      address: "0x234567891234567891234567891234567890",
      vote: 3, // VoteValues.NO
    }
  ]
}
```
*/
