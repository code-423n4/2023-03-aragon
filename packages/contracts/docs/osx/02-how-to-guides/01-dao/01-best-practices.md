---
title: Best Practices
---

## Advices for Operating your DAO

### DOs ๐

- Make sure that at least one address (typically a governance plugin) has `EXECUTE_PERMISSION_ID` permission so that it can execute on the DAO.
- Check every proposal asking to install, update, or uninstall a plugin with utmost care and review
  - the implementation contract
  - the setup contract
  - the helper contracts
  - the permissions

### DON'Ts โ

- Incapacitate your DAO by revoking the last `EXECUTE_PERMISSION_ID`.
  - by uninstalling your last governance plugin.
  - applying an update to your last governance plugin.
- Creating a DAO with no plugins, or with plugins that canโt effectively execute.
- Giver permissions to directly call things on the DAO. Better use a plugin instead.

In the following sections, you will learn about the details.
