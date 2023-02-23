/* MARKDOWN
### Add and pin metadata for the Multisig plugin

Adds an pin data with a the format used by aragon app into one of the specified IPFS nodes and return a IPFS CID preceded by "ipfs://"
*/

import {
  ContextPlugin,
  MultisigClient,
  ProposalMetadata
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin = ContextPlugin.fromContext(context);
// Instantiate a Multisig plugin client.
const multisigClient: MultisigClient = new MultisigClient(contextPlugin);

const metadata: ProposalMetadata = {
  title: "Test Proposal",
  summary: "This is a short description",
  description: "This is a long description",
  resources: [
    {
      name: "Discord",
      url: "https://discord.com/..."
    },
    {
      name: "Website",
      url: "https://website..."
    },
  ],
  media: {
    logo: "https://...",
    header: "https://..."
  },
};
const metadataUri: string = await multisigClient.methods.pinMetadata(metadata);
console.log({ metadataUri });

/* MARKDOWN
Returns:

```javascript
  "ipfs://Qm..."
```
*/
