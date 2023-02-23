/* MARKDOWN
### Decode an update metadata raw action

Decode an update metadata action and expect an IPFS URI containing the CID of the metadata.
*/

import { Client } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Insantiates an aragonOSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of an update metadata raw action.
const decodedUpdateMetadata: string = client.decoding.updateDaoMetadataRawAction(data);
console.log({ decodedUpdateMetadata });

/* MARKDOWN
Returns:

```javascript
  "ipfs://Qm..."
```
*/
