/* MARKDOWN
### Decode Remove Members Action (AddresslistVoting)

Decodes the action of removing addresses from the AddresslistVoting plugin so they can no longer vote in AddresslistVoting proposals.
*/

import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Insantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiate an Addresslist plugin client.
const clientAddressList = new AddresslistVotingClient(contextPlugin);

const data: Uint8Array = new Uint8Array([12, 56]);

const removedMembers: string[] = clientAddressList.decoding.removeMembersAction(data);
console.log({ removedMembers });

/* MARKDOWN
Returns:

```json
[
  "0x12345...",
  "0x56789...",
  "0x13579..."
]
```
*/
