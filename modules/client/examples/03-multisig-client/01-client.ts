/* MARKDOWN
### Create an Multisig client

Creating a multisig client allows you to access the Multisig plugin from your DAO.
In order to interact with the Multisig plugin, you need to create a `MultisigClient`. This is created using the `ContextPlugin`.
*/

import { ContextPlugin, MultisigClient } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Create a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Creates a Multisig plugin client.
const multisigClient: MultisigClient= new MultisigClient(contextPlugin);
console.log({ multisigClient });
