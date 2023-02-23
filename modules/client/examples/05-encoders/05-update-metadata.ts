/* MARKDOWN
### Update DAO's Metadata

Updates the metadata of a given DAO.
*/

import { Client, Context, DaoMetadata } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiates an aragonOSx SDK client.
const client: Client = new Client(context);

const metadataParams: DaoMetadata = {
  name: "New Name",
  description: "New description",
  avatar: "https://theavatar.com/image.jpg",
  links: [
    {
      url: "https://discord.com/...",
      name: "Discord"
    },
    {
      url: "https://twitter.com/...",
      name: "Twitter"
    }
  ]
};

const daoAddressOrEns: string = "0x123458235832745982839878932332423"; // or my-dao.dao.eth

// Pins the metadata in IPFS and returns the IPFS URI.
const ipfsUri = await client.methods.pinMetadata(metadataParams);

// Update the metadata of a given DAO.
const updateDaoMetadataAction = await client.encoding.updateDaoMetadataAction(daoAddressOrEns, ipfsUri);
console.log({ updateDaoMetadataAction });
