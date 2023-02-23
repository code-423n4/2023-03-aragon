/* MARKDOWN
### Set Plugin Config Action (Address List)

Updates the settings of a given AddresslistVoting plugin.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  VotingMode,
  VotingSettings
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates an AddresslistVoting client.
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

// The action object for updating the plugin settings.
const configActionPrarms: VotingSettings = {
  minDuration: 60 * 60 * 24 * 2, // seconds
  minParticipation: 0.25, // 25%
  supportThreshold: 0.5, // 50%
  minProposerVotingPower: BigInt("5000"), // default 0
  votingMode: VotingMode.STANDARD // default STANDARD, otherwise EARLY_EXECUTION or VOTE_REPLACEMENT
};

const pluginAddress = "0x1234567890123456789012345678901234567890"; // the address of the plugin contract itself

const configAction = addresslistVotingClient.encoding.updatePluginSettingsAction(pluginAddress, configActionPrarms);
console.log({ configAction });
