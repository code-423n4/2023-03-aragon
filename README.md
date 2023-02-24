# Aragon Contest Details

- Total Prize Pool: Sum of below awards
    - HM awards: $63,750 USDC
    - QA report awards: $7,500 USDC
    - Gas report awards: $3,750 USDC
    - Judge + presort awards: $15,000 USDC
    - Scout awards: $500 USDC
- Join [C4 Discord](https://discord.gg/code4rena) to register
- Submit findings [using the C4 form](https://code4rena.com/contests/2023-02-aragon-contest/submit)
- [Read our guidelines for more details](https://docs.code4rena.com/roles/wardens)
- Starts February 24, 2023 20:00 UTC
- Ends March 04, 2023 20:00 UTC

# Overview

<aside>
💡 The Aragon OSx is a DAO framework enabling users to create, manage, and customize DAOs.

</aside>

# In Scope

In scope, you will find all *Core and Framework Contracts*, as well as our plugins.

Additionally, you can find [here the addresses of the active contracts](https://github.com/aragon/osx/blob/develop/active_contracts.json) we have deployed to Goerli, Mumbai, Arbitrum-Rinkeby, and Rinkeby.

<aside>
💡 We’d like to bring special attention to the `PluginProcessor` contract which installs plugins into DAOs, as well as the `DAO` contract which holds all DAO assets.

</aside>

This section lists files that are in scope for auditing:

- **Included Files:**
    - `packages/contracts/**/*.sol`
- **Excluded Paths:**
    - `*/node_modules`
    - `*/mock*`
    - `*/test*`
    - `*/migrations`
    - `*/Migrations.sol`

### Contracts **Size**

- **Lines of code**: total lines of the source unit
- **nLines**: normalized lines of the source unit (e.g. normalizes functions spanning multiple lines)
- **nSLOC**: normalized source lines of code (only source-code lines; no comments, no blank lines)
- **Comment Lines**: lines containing single or block comments
- **Complexity Score**: a custom complexity score derived from code statements that are known to introduce code complexity (branches, loops, calls, external interfaces, ...)

## Out of scope

- [Subgraph package](https://github.com/aragon/osx/tree/develop/packages/subgraph)
- [Contract-ethers package](https://github.com/aragon/osx/tree/develop/packages/contracts-ethers)
- Excluded paths:
    - `*/node_modules`
    - `*/mock*`
    - `*/test*`
    - `*/migrations`
    - `*/Migrations.sol`
- External libraries:
    - `@openzeppelin/*`
    - `@ensdomains/*`

Any issues or improvements on how we integrate with the contracts above is within scope.

## Additional Context

### DAOStar.One

In order to be future-proof and standardized with the industry, we have adopted the [DAOStar.One](http://DAOStar.One) specifications for interfaces.

### Plugins

Plugins don’t have to follow a specific base, although we provide 3 potential base contracts to build upon as options:

- [Basic Plugin](https://github.com/aragon/osx/blob/develop/packages/contracts/src/core/plugin/Plugin.sol)
- [Plugin Cloneable](https://github.com/aragon/osx/blob/develop/packages/contracts/src/core/plugin/PluginCloneable.sol)
- [Plugin UUPS Upgradeable](https://github.com/aragon/osx/blob/develop/packages/contracts/src/core/plugin/PluginUUPSUpgradeable.sol)

— you can find more information about [plugin types here](https://devs-stg.aragon.org/docs/core/how-to-guides/plugin-development/implemention/plugin-types).

### Upgrades

A lot of our contracts are upgradeable, meaning we can deploy upgradeable proxies in the future if need be - allowing us to add more features overtime.

For an overview of the upgrade pattern, please refer to the [OpenZeppelin documentation](https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable).

### Meta transactions

In many occasions, we have also allowed for meta transactions to occur - enabling a trusted referrer to pay the gas fees of others’ transactions.

For an overview on meta transactions, please refer to [OpenZeppelin documentation](https://docs.openzeppelin.com/learn/sending-gasless-transactions).

### **Inline Documentation**

You should find Natspec documentation for every content in the repo.

— **Comment-to-Source Ratio:** On average there are`2.13` code lines per comment (lower=better).

### **Components**

### **Exposed Functions**

This section lists functions that are explicitly declared public or payable. Please note that getter methods for public stateVars are not included.

# Tests

You can find some [test DAOs here](https://github.com/aragon/osx/blob/develop/dummy_daos.json) if you’re looking to get started with testing.

To run tests, run these commands in your terminal:

```bash
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
```

For faster runs of your tests and scripts, consider skipping `ts-node`'s type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment.

For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).

# Deployment

To deploy contracts, run these commands in your terminal:

```bash
npx hardhat run scripts/deploy.ts
TS_NODE_FILES=true npx ts-node scripts/deploy.ts
npx eslint '**/*.{js,ts}'
npx eslint '**/*.{js,ts}' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

You can find more details about [our deployment checklist here](https://github.com/aragon/osx/blob/develop/DEPLOYMENT_CHECKLIST.md).

# Releases

Contract releases are tracked in [Releases.md](https://github.com/aragon/osx/blob/develop/packages/contracts/Releases.md).

To review the changes in the repository, you can visit the `[CHANGELOG.md](http://CHANGELOG.md)` [here.](https://github.com/aragon/osx/blob/develop/packages/contracts/CHANGELOG.md)

# Automated testing

We use Mythx for automated security testing within our [CI pipeline](https://github.com/aragon/osx/blob/a689d7d451fa37d854647df0d8f056b423423709/.github/workflows/mythx-full.yml) using [this configuration](https://github.com/aragon/osx/blob/develop/.mythx.yml).

# Known issues

### UUPS upgradeable initializers

**Feedback:** The constructor on multiple contracts under `token/ERC20/governance` do call the initialize function on the implementation. Since the contract will be used on a proxy environment it is recommended to simply call `_disableInitializers` on the `constructor` which will lock the initialisation process on the implementation contract and will cost less gas than having to call the `initialize` function with all the arguments.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c4cda152-7ef4-4c07-ba36-dc2cb5b5656c/Untitled.png)

<aside>
💡 **Response:** This is not possible, the way things are implemented and used.

The reason we got a different way in `GovernanceERC20` and `GovernanceWrappedERC20`(not putting `disableInitializers()` in the `constructor`).
This is because we want these contracts to be deployed with minimal proxy clones or new keyword directly. The current way allows to do both.
NOTE - that it can still be deployed with Transparent proxy(not uups though), but Aragon will never deploy it with even Transparent as it should be non-upgradeable.
In order to support minimal proxy or new, the current way seems the right way to go. putting `disableInitializers` in the constructor is not required anymore, because when you're deploying the base, `constructor` will call `initialize` and initializer `modifier` will be run, which means base will end up initialized already. F
or the minimal proxy, proxy will call initialize and that's it.

The thing you mention about cheaper gas cost is correct, though in case of minimal proxy situation, it's negligible because this higher cost will only happen for one single base deployment done by Aragon. The higher gas cost is relevant for new keyword deployment, but to be honest, it's not going to be much.

</aside>

### Minting/burning could depeg the token

**Feedback:** We have seen that `GovernanceWrappedERC20` does create two internal functions (we haven't seen usage/implications yet), `_mint` and `_burn`. Those two functions are minting/burning on the wrapping token which can cause discrepancies and unpegging with what the actual user has on the underlaying token.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/81332e9e-2bd8-42ab-a9d7-405f7c6b6112/Untitled.png)

<aside>
💡 **Response:** The reason why `GovernanceWrappedERC20` contains `_mint`/`burn` (note they are internal) isn't because of some hidden logic by Aragon. They're just there to compile the code, otherwise solidity is ambiguous. Take a look here - they also do the same.  [https://docs.openzeppelin.com/contracts/4.x/governance](https://docs.openzeppelin.com/contracts/4.x/governance).

Since they're internal, it can't be called from outside. And `_mint` in the end will only be executed by `depositFor` and `_burn` by `withdrawTo` which seems to be correct.

</aside>

### Grant with condition with ANY_ADDR

**Feedback:** In the current `PermissionManager` implementation - the `grant` function does call internally the `_grantWithCondition` using the `ALLOW_FLAG` address. The documentation states that it will be possible to grant permissions to any caller (`ANY_ADDR` on who) on a valid "where" address. However, when this condition is meet the `_grantWithCondition` will always revert with `ConditionNotPresentForAnyAddress`:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a1421163-b43e-4a8e-ada7-346ae58b3948/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/ef12adb9-0912-4700-ae9a-5332c968b244/Untitled.png)

<aside>
💡 **Response:** I think documentation is not updated, but will be getting updated soon today.

We only allow setting `who`/ `where` to `ANY_ADDR` if `oracle` is present.

if `oracle` is not present in `ANY_ADDR` case, it should revert.

</aside>

Condition is a specified `address` but the `grant` function will always use `ALLOW_FLAG` as the `condition`. Probably reverting inside those functions will assure that they are never used!

<aside>
💡 **Response:** There also exists `public grantWithCondition` where you can actually pass a `condition` contract.

Reverting is important. We thought about it not to revert in that case and simply return `false` but our `Plugin Setup Processor` calls this function and if it returns `false` it’s not ideal.

</aside>

### Auth system (1)

**Feedback:** `PermissionManager`, the internal `_auth` function does check if you have the `permissionId` for the current contract (`address(this)`) and returns true if you do. That means that if i ever give a user x `permission` to a contract using `PermissionManager` this user will also have permission x over any `WHERE`:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/dd98587e-8488-43e6-ac4d-870d31f166bf/Untitled.png)

<aside>
💡 **Response:** So, the scenario -

1. user is granted x `permission` on the `PermissionManager` contract.
2. user will be able to call functions with x `permission` on other contracts as well?
</aside>

As you check for `!isGranted(this) && !isGranted(where)` which will only return `true` if both cases are `false.`

<aside>
💡 **Response:** It should be like this -

1. `auth` is only used inside this `PermissionManager`.
2. If you check where it's used, they are used for `grant`, `grantWithCondition`, `revoke` + `applyMultiTargetPermissions` + `applySingleTargetPermissions`

For `grant`, `grantWithCondition` , and `revoke` - the idea is  it should always check the first expression in `if`.

So how would `user` have the ability to call functions with `x` permission protected on other contracts unless other contracts use this exact function?

For `applyMultiTargetPermissions` + `applySingleTargetPermissions`,  they only include `_auth(item.where , ROOT_PERMISSION)`.  For this, if user has `x` permission on `address(this)`, it should not revert and if not, it should check whether user has `x` permission on `item.where`.

</aside>

<aside>
💡 I might be wrong, but maybe I don't see the same case you're talking about.

In terms of `ROOT_permission`, if `user` has `ROOT` on this `PermissionManager`, it can start giving permissions to other people on this contract or any other contract that belongs to the same `DAO`.

The great thing(feature) here is that if `users` can have `ROOT_PERMISSION`s on single contracts (not only necessarily on `PermissionManager`, which means `if user === root` on contract X, he/she can give other permissions on contract X to other people. Just wanted to mention this for better understanding.

This is one of the most important parts.

</aside>

### Auth system (2)

- WARNING: The feature discussed below was eventually removed

    Do you remember the confusion you had with permissions?

    Address(this) and where? We had a talk and we will be removing this feature which means permission manager wont check the address this anymore !! Sorry for this


**Feedback:** Regarding the concern I had with the auth system, this is the POC. As you can see the second `functionAuth` call should be reverting but it does not. It looks like you are always using `_auth(address(this), ....)` probably everywhere. But can POC condition ever exist?

The `_auth` check would always be treating any permission as `auth(ANY_ADDR, who, permission)` if the first argument is `!= address(this)` for this contract.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c5625582-4252-4a7a-a217-c04efc257fe3/Untitled.png)

<aside>
💡 **Response:** We don't have `auth(where, PERMISSION1)` anywhere in `DAO` or in `PermissionManager`.

In `DAO`, we got: `auth(address(this), PERMISSION1)`.
In `PermissionManager`, we got `auth(where, ROOT_PERMISSION_ID)`.

For the `PermissionManager` case, `auth(where, ROOT_PERMISSION_ID)`, this means if you got `ROOT` on `PermissionManager`, you also have `ROOT` on any other contract part of this `PermissionManager`. If you have `ROOT` on contract `x`, you only have `ROOT` on contract `x`. In terms of hierarchy, having `ROOT` on `PermissionManager` makes you the kind of the whole country, but having `ROOT` on contract gets you to be the king of the city.

For the `DAO` case, we always check `address(this)`.

I Believe the case you're mentioning doesn’t exist now, and we should be careful to not include it in the future ever. Thoughts?

</aside>

If you have permission `x` on `PermissionManager`, you will have that permission on any other `where` contract added into the manager.

Then, what the purpose of having `ANY_ADDR` on `where` if this is always the case?

<aside>
💡 **Response:** yes, but this is only for `ROOT_permission` , which is desired. For other permissions, it’s not true.

</aside>

My POC had `PERMISSION1`, not `ROOT` which allows me to have `PERMISSION1` on `ANY_ADDRR` other contract, such as ALICE.

<aside>
💡 **Response:** Correct, but your POC worked, because you used modifier `auth(where, PERMISSION1)` there. Such modifier doesn't exist in `PermissionManager` and never should.

If the worry is that plugins will have such an `auth` modifier, it won't because we got different `auth` modifier for them. So that modifier doesn't check `private _auth` but checks `(dao.hasPermission())`
Definitely some parts of this is confusing, but due to making sure it's as cheap as possible and allows the feature of my example(king of the country, king of the city, we had to do it).

</aside>

All plugins and the DAO do inherit from `PermissionManager` from what I saw. But is it possible ANYWHERE to have a standalone `PermissionManager` and have it be re-used (since the contract is not abstract)?

<aside>
💡 **Response:** plugins don't have their own `PermissionManager`. They basically store the address of the `DAO`(DAO is the same thing as `PermissionManager`). Plugins also have `auth` modifier that has this:

```jsx
if (!_dao.hasPermission(addressThis, _msgSender, _permissionId, _msgData))
	revert DaoUnauthorized({
	dao: address(_dao),
	here: addressThis,
	where: addressThis,
	who: _msgSender,
	permissionId: _permissionId
});
```

— Which doesn't use the modifier of `PermissionManager`.

Plugins don't inherit from `PermissionManager`, only `DAO` does.

</aside>

I meant `PluginRepo`, not all plugins..

<aside>
💡 **Response:** Each plugin has their own `PluginRepo`, hence their own `PermissionManager`.

A `PluginRepo` also includes `auth(address(this), permission)`.

I think the guideline here is:

1. the contracts that inherit from `PermissionManager` should never have `auth(where, permission)` modifier. They only should have `address(this, permission)`.
2. The `PermissionManager` should only have `auth(where, ROOT_PERMISSION)`.

This way, your POC wouldn't succeed, would it?

Basically, for plugins (not the `PluginRepo`), or any other contract, your POC wouldn't be valid because they can't use the `auth` modifier from `PermissionManager` as they don't inherit from it. As the `DAO` contract itself and `PluginRepo`, your POC is valid if in `DAO` or `PluginRepo`, one says `auth(where, permission)`.

</aside>

Then probably a suggestion would be to actually simplify those modifiers to already use `address(this)`, similar to what you have on the `DAO`.

<aside>
💡 **Response:** you mean modifiers for `grantWithOrace`, `grant`, `revoke` , right ?

</aside>

The `auth` modifier under `PermissionManager` to already use `address(this)` instead of `where`? So only 1 parameter.

There is no scenario possible that where `!= address(this)` and in that case my POC could probably apply.

<aside>
💡 **Response:** The beauty of it is the following - imagine a `DAO` has 4 plugins and `DAO` has 1 `ROOT` person.
Now, with the current way, you have a possibility that you `grant` `ROOT_PERMISSION` on `plugin_1` to person `x` and then, that person `x` can start giving out other permissions to other people on ONLY `plugin_1`. If we don't do the following, only that one person(`root`) can `grant` permissions.

FYI: [https://github.com/aragon/core/blob/398a3f4fe6f257416d1cd7842ca13a9bc4e8b06a/packages/contracts/src/core/permission/PermissionManager.sol#L115](https://github.com/aragon/core/blob/398a3f4fe6f257416d1cd7842ca13a9bc4e8b06a/packages/contracts/src/core/permission/PermissionManager.sol#L115)

</aside>

So, if we give `PERMISSION x` on the `DAO` that means I have `PERMISSION x` on all plugins/ `where (PERMISSION x not being root)` ?

[https://github.com/aragon/core/blob/398a3f4fe6f257416d1cd7842ca13a9bc4e8b06a/packages/contracts/src/core/permission/PermissionManager.sol#L336](https://github.com/aragon/core/blob/398a3f4fe6f257416d1cd7842ca13a9bc4e8b06a/packages/contracts/src/core/permission/PermissionManager.sol#L336)

<aside>
💡 **Response:** This statement would be `true` if plugins are using the exact same modifier as `PermissionManager`'s modifier (`auth`) that was just copied/pasted in the link above.

</aside>

But hey are using `DAO` `hasPermission` 😊

<aside>
💡 **Response:** Exactly, which doesn't have `address(this)` check.

</aside>

Here we go!

<aside>
💡 **Response:** I agree, confusing!

I wrote it down one more time just so we don't miss something here:

1. If the contract `x` inherits from `PermissionManager`, it should only be using modifier such as `auth(address(this, permission)`. If not, and it has `auth(where, permission)`, this is dangerous, because if user `A` is granted permission `Y` on `address(this) = x`, it automatically means it has permission `Y` anywhere.
This might be desirable though.. Currently, this feature by default works like this for `ROOT_PERMISSION`. If you got `ROOT_PERMISSION` on contract `x`, you got `ROOT_PERMISSION` on any contract that uses `x` as its `PermissionManager`.
This allows you to start giving out permissions to other people on any contract for `ROOT_PERMISSION` or you can only become `ROOT` for contract `z` and you can give permissions to people on contract `z` ONLY.
Using `auth(where, permission)` on `x` contract not advisable, but could be intended feature. Would this bring any other concern other than the intended feature?
2. Regarding plugins or other contracts that are part of `DAO`, they shouldn't use the modifier of `PermissionManager`, because if they do, we got the same situation as in (1).
But, unless the contract writes a custom own function for this, it can't use private function `(auth)` of `PermissionManager`.
</aside>

### Proposal vs ProposalUpgradeable

**Feedback:** Is there any reason why you have the `Proposal` and `ProposalUpgradeable` differentiation? Both are being used in the context of an upgradeable contract plugin with initialize a function.

`Proposal` is being used on the `Admin` contract and `ProposalUpgradeable` on the `Multisig` contract.

<aside>
💡 **Response:**

1. `Admin` contract isn't upgradeable (but you're right, since it gets deployed with minimal clone proxy - it follows the initialize function structure), and I believe `Admin` should be inheriting from `ProposalUpgradeable` for consistency (even though the current way is not dangerous).
2. If `ProposalUpgradeable` inherits from `ProposalBase`, we get something inconsistent (which is, there's no `_gap` in `proposal` base. We might need to rename it to `ProposalBaseUpgradeable`).
</aside>

<aside>
💡 **Update:** About this change, we thought about it and we might completely remove `ProposalBase` class and only have `Proposal` and `ProposalUpgradeable` (this one with a `_gap`). Their code will be the same (duplicated), but for consistency, this is more future-proof.

`Admin` inheriting from `ProposalUpgradeable`, where as `Proposal` will just be non-used for now, but still there.

</aside>

### PluginRepoFactory

**Feedback:** Regarding the `PluginRepoFactory` - is it normal that anyone can call `createPluginRepo` without any restriction?

I know that internally it will call the `registerPluginRepo` function on the `pluginRepoRegistry` that requires `REGISTER_PLUGIN_REPO_PERMISSION_ID` authorization. But the caller, aka `msg.sender` will be `PluginRepoFactory` and not the actual caller to `createPluginRepo`.

The `DAO` will have an allowance, aka `auth` from `PluginRepoFactory` to `PluginRepoRegistry` with `REGISTER_PLUGIN_REPO_PERMISSION_ID` permission. Is this expected behaviour?

<aside>
💡 **Response:** Yes, this is expected. We thought about restricting it, but really couldn't come up with an idea who should be able to call it and who shouldn't.

</aside>

<aside>
💡 FYI - The `PluginRepoFactory` is basically the same as the `DAO` factory, in terms that it is meant to be permissionless.

We have no restriction on who could use it, currently.

If someone abuses the factory to register misleading ENS subdomains (`xxx.plugin.dao.eth`), we could get the ENS controller to revoke certain dishonest cases.

For the rest, publishing a plugin, is pretty much like NPM.

Maybe I'm missing something, but what's the benefit of restricting developers to publish plugins? Nobody will get them unless they execute a proposal that explicitly deploys them and grants them permissions.

</aside>

### Missing disableInitializer in Admin

<aside>
💡 **Context:** we seem to have forgotten to include `disableInitializers` in `Admin.sol`. Even though, it's really not needed as it's not doing any permission there(to make `upgradeTo` attack). We can still add it if you see fit~

Note - that since `Admin` is non-upgradeable, thats why we think no `upgradeTo` attack happens.

</aside>

### ENS registrar

**Question:** Expecting the DAORegistry and PluginRepoRegistry to have different ENSSubdomainRegistrar right? So different ENS domains/subdomains?

### ProposalBase

<aside>
💡 **Context:** We need to do `ProposalBase` changes and this made us realize couple of other places where we had `ERC165` implemented not fully correct (some contracts missing some interfaces for `ERC165`) and so on. This caused lots of contracts to change. 25-30 contract files, but changes are only about `ERC165` and nothing related to security.

</aside>

### Contract virtual methods

**Feedback:** From the contract alone perspective, there shouldn't be any issue on changing those methods to `virtual` and abstracting the contract.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/b40afe1e-3c52-4cfc-99c5-13485276f5de/Untitled.png)

The problem will be on the contracts actually using or overriding those methods. Take a look on the following example. You would expect anyone calling `test()` on `Test2` to revert, right?

Because this is overriding the `Test` function which has the `doRevert` modifier. Well, it is not the case. The modifier is ignored since the overrIding function does have the `doRevert` modifier.

In your case, I will have to verify that all methods that are overriden do contain the same modifiers as the abstract contract.

<aside>
💡 **Response:** We are aware of this case and currently, none of the contracts that use `PermissionManager` actually override anything, so we should be good on that front.
The question was more like if one function is overriden, it could have more hidden implication about the logic of `PermissionManagaer`?

</aside>

### Apply installation without prepare installation

**Feedback:** it is expected that the `applyInstallation` can be called without a `prepareInstallation`? There is no check on apply of the `pluginState.preparedSetupIdToBlockNumber` field.

<aside>
💡 **Response: I**t is not expected, but there are checks for this.

</aside>

Neither there is a check of the `repoRegistry.entries` on the `apply` if that link fails. Let me try to see if i can leverage a POC.

<aside>
💡 **Response: T**he following code is in `applyInstallation -`

```jsx
// Check if this plugin is already installed.
if (pluginState.currentAppliedSetupId != bytes32(0)) {
	revert PluginAlreadyInstalled();
}
```

```
    validatePreparedSetupId(pluginInstallationId, preparedSetupId);
```

</aside>

The validate:

```solidity
function validatePreparedSetupId(
    bytes32 pluginInstallationId,
    bytes32 preparedSetupId
) public view {
    PluginState storage pluginState = states[pluginInstallationId];
    if (pluginState.blockNumber >= pluginState.preparedSetupIdToBlockNumber[preparedSetupId]) {
        revert SetupNotApplicable({preparedSetupId: preparedSetupId});
    }
}

```

It does compare against `blockNumber` on the `pluginState`, which is set after the actual `validatePreparedSetupId` check:

```solidity
    validatePreparedSetupId(pluginInstallationId, preparedSetupId);

    bytes32 appliedSetupId = _getAppliedSetupId(_params.pluginSetupRef, _params.helpersHash);

    pluginState.currentAppliedSetupId = appliedSetupId;
    pluginState.blockNumber = block.number;

```

Probably the check will be comparing `0 >= 0` if there is no `prepare`.

And you will be safe, but doesn't sound like this check was meant to do this `0 >= 0`  comparison.

<aside>
💡 **Response:** yes! If preparation doesn't exist, it means the check always will be `0 >= 0`.

That's what the check is for. We're doing our best to have less gas costs, hence why it might a complicated code.

</aside>

<aside>
💡 `validatePreparedSetup` handles 2 cases:

- if preparation doesn't exist, `pluginState.preparedSetupIdToBlockNumber[preparedSetupId]` will always be `0` which means `pluginState.blockNumber` will always be `>=0` and we will get an expected `revert`.
- If preparation does exist, it doesn't mean it's always a valid one. When could it be invalid you might say that the preparation for the same plugin happened multiple times.
    - For ex, imagine plugin is on 1.0 version, `user` called `prepareUpdate` to 2.0, but some people decided 2.0 is not the way to go or whatever.  They call another `prepareUpdate` for the exact same plugin and version. What you get now is there're multiple preparations for the same exact current plugin. Both can be applied, BUT once one of them is applied, then it's game over. None of them can be applied anymore. E.x: when `applyUpdate` was called for `preparation1`, `pluginState.blockNumber = block.number` was called. Now, if you call `applyUpdate` again for `preparation2`, `pluginState.blockNumber will be >= pluginState.preparedSetupIdToBlockNumber[preparedSetupId]` and will `revert`. The same thing applies to `prepareUninstallation` + `applyUninstallation` too.

NOTE -  we also add `PreparationType` in the `_getPreparedSetupId`. This is needed because we found out that it was possible in one case that after you called `prepareUninstallation`, you could call `applyUpdate` for it - which would make everything horrible.

</aside>

<aside>
💡 **Why `EMPTY_ARRAY_HASH` and `ZERO_BYTES_HASH` exist:**

Now that the `blockNumber` stuff is understood, here’s another scenario.

When you do `prepareX`, we only store one thing only `bytes32` in order to avoid costs. Once `prepare` is called, if you want to be able to call `applyX`, you should pass the same arguments that was used in preparation!

- Explanation for `ZERO_BYTES_HASH`

    As you see, `getPreparedSetupId` has 5 arguments. Let's take one example.
    In `prepareUninstallation`, when you call it, we generate `preparedSetupId` the following way.

    ```solidity
    bytes32 preparedSetupId = _getPreparedSetupId(
    	_params.pluginSetupRef,
    	hashPermissions(permissions),
    	ZERO_BYTES_HASH,
    	bytes(""),
    	PreparationType.Uninstallation
    );
    ```

    The reason we put `ZERO_BYTES_HASH` in there is that basically, 3rd argument is the `helpersHash` argument, but in `prepareUninstallation`,  we no longer have `helpers` anymore.  So `applyUninstallation` can be called without passing `helpers`. So we just put there some hardcoded value. Something had to be there right as Solidity doesn't have optional arguments.

- Explanation of passing things around

    The `prepareInstallation` of `pluginSetup` deploys `helpers` and returns them alongside permissions. The idea is this helpers might be necessary in the `prepareUpdate`. The idea is plugin developer when he writes his `prepareUpdate` will need what helpers were deployed while his plugin was installed.
    So, whatever `helpers` plugin installation deployed, it's important that the EXACT SAME ORDER is passed back to `prepareUpdate` so dev could feel safe the caller didn't maliciously changed `helpers` array while calling `prepareUpdate` of `PluginSetupProcessor`.
    Then it gets even interesting. `prepareUpdate` might have deployed more `helpers`,  so dev should update the `helpers` array and return it and this updated `helpers` array should be passed for the second update.

    E.x. you update plugin to 2.0 which deployed `helper1`, `helper2`. Now, when you call `prepraeUpdate` from 2.0 to 3.0, you have to pass `helper1`, `helper2` otherwise it will fail. So you're passing things around.

- Explanation of `EMPTY_ARRAY_HASH`

    This is special case. It might happen that update from 1.0 to 2.0 might be a case where contract didn't change, but only UI changed. We require people to go through the same flow even if only UI was changed on `PluginRepo`.  When `prepareUpdate` for this case is called, we do:

    ```solidity
    preparedSetupId = _getPreparedSetupId(
    	PluginSetupRef(_params.newVersionTag, _params.pluginSetupRepo),
    	EMPTY_ARRAY_HASH, // This is permissionHash place
    	currentHelpersHash,
    	bytes(""),
    	PreparationType.Update
    );
    ```

- Why did we put `EMPTY_ARRAY_HASH` there and not `ZERO_BYTES_HASH`

    Because for this `prepareUpdate` case, `user` still has to pass permissions in the params, but for sure, it's not relevant (there'd be no permissions if you don't call `prepareUpdate` of `PluginSetup`), so user would pass permissions in the param as `[]` (there's no `null` value possibility to pass in Solidity) to mimic the behaviour of the following:

    ```solidity
    preparedSetupId = _getPreparedSetupId(
    	PluginSetupRef(_params.newVersionTag, _params.pluginSetupRepo),
    	hashOf([])
    	currentHelpersHash,
    	bytes(""),
    	PreparationType.Update
    );
    ```

    But to reduce costs, we don't do `hashOf([])` and directly put it in. It's also very important why we do `hashOf([])`.

    Another reason is `applyUpdate` doesn't know whether `prepareUpdate` was called only for a UI update or contract as well. So `applyUpdate` should always do `hashPermissions(_params.permissions)` where for UI update, it would be `hashPermissions([])` and it would exactly match the `EMPTY_ARRAY_HASH`.

</aside>

### Ratio Base

**Feedback:** What is the purpose of `RATIO_BASE`?

Looks like you are using floating point precision incremental for percentages, right? `[0, 100%]` being mapped to `[0, 10**6]`

<aside>
💡 **Response:** Correct.

It's a fixed-precision way to encode percentages.

The goal is that that external clients can use plain `number`'s instead of `bigint`'s, among others

</aside>

### Try Early execution

**Feedback:** With the `_tryEarlyExecution` usage on `MajorityVoting` system, there is no way to prevent someone with enough voting power to automatically propose and execute on the same transaction, right? Have you assumed that risk?

<aside>
💡 **Response:** This is expected behavior.

If the active governance settings make it so that a whale has enough tokens to early execute proposals alone, then forcing things to happen in 2 transactions makes little difference.

This falls on the `DAO`'s design side, more than on the technical one.
The `Admin` plugin is a simplified version of this scenario.

</aside>

Makes sense, having some sort of time lock or waiting until the end of the proposal time would defeat the purpose of having early execute too.

<aside>
💡 **Response:** Early execution is intended to also save gas/transactions.
Why allowing to continue voting, if mathematically, results cannot change the outcome?

In general, any variants of the plugin design that we may think of will result in a new plugin. For example, vote delegation, delay locks, etc... these make for a different piece that serves another use case.

This plugin is intended to serve the general case first.

</aside>

### ERC token casuistics

**Feedback:** From a user perspective, how are you going to manage the different ERC20 cases under the TokenVotingSetup contract? For example, the wrapped `version will require the user to approve funds from the underlaying token to the wrapped contract and call` depositFor after that. Meanwhile the GovernanceERC20 does not require calling any depositFor.

<aside>
💡 **Response:** if `user` passes an existing token, we wrap it. Then it’s up to the token holders to call `approve` and `depositFor` later if they want to be able to vote with it.

In case of `Governance ERC20`, they don’t have to do anything. They immediately can start voting.

</aside>

So, will you provide any feedback on the UI for this case?

<aside>
💡 **Response:** That’s the plan - or in the next version of token voting setup we will think of something.

</aside>

### Execute permission during plugin install

**Feedback:** What is the purpose of giving a plugin during installation the `EXECUTE_PERMISSION_ID`?

```solidity
    // Grant `EXECUTE_PERMISSION` of the DAO to the plugin.
    permissions[2] = PermissionLib.MultiTargetPermission(
        PermissionLib.Operation.Grant,
        _dao,
        plugin,
        NO_CONDITION,
        DAO(payable(_dao)).EXECUTE_PERMISSION_ID()
    );
```

In case of a bad plugin, that allowed calling contracts, wouldn't that cause the ability from the plugin to execute `DAO` proposals?

<aside>
💡 **Response:** If we don't do it, then plugin will not be able to execute anything on `DAO`. For example, if you don't give this permission to the `TokenVoting` plugin, it will never be able to `execute` proposal actions.

You might say to solve above, then users of `DAO` would manually `grant` this permission later, but this causes bad UX.

The reason why there're 2 functions (`prepareX`, `applyX`) is that people call `prepareX` then create a proposal for `applyX`, but since `prepareX` was actually executed, people can see on the `applyX` proposal what the exact permissions it will apply in case of installing.

And it's up to them to decide whether to trust it or not. There truly doesn't seem like a better way as we thought about it.

— One of the change we will do is:

[https://github.com/aragon/osx/blob/da2d546481a1534f23195d3f7367e154edd68055/packages/contracts/src/framework/plugin/setup/PluginSetupProcessor.sol#L454](https://github.com/aragon/osx/blob/da2d546481a1534f23195d3f7367e154edd68055/packages/contracts/src/framework/plugin/setup/PluginSetupProcessor.sol#L454)

The case why this is needed is that 1.0 was a plugin's first version. Then 1.1 came, but it's only a UI update (the `PluginSetup` is the same).

Then 1.2 came which is a contract change.

If user updates from 1.0 to 1.1, it will only treat it as UI update, but what's important is if from 1.1 to 1.2 happens, 1.2 will need helpers that were deployed in 1.0.
The above code addition just makes sure to pass helpers around.

</aside>

### Multiple governance mechanisms

**Feedback:** Can multiple governance voting system coexhist for a DAO?

<aside>
💡 **Response:** Yes

</aside>

Wouldn't that cause all governance plugins to start from `proposalID` `0` since each plugin will be using its `ProposalUpgradeable` counter?

(I'm thinking on a way to centralize the governance plugin so we don't give execute permissions to contracts)

<aside>
💡 **Response:** Correct. But even if you centralize it, you have the same problem.

Imagine 3 governance plugins that in the end calls this centralized contract that in the end calls `execute` on `DAO`.

If a plugin can call this centralized contract, it implicitly means it can call `execute` on `DAO`.

</aside>

I don't know if that could be causing some issues, for example on the `DAO` event you will see callId duplicated, but `sender` different:

`emit Executed(msg.sender, _callId, _actions, failureMap, execResults);`

<aside>
💡 **Response: I**n that sense, what we do is `proposalId` in the end is presumed to be `pluginAddress + nonce(counter)`.

`msg.sender` in `Executed` event will be a `pluginAddress`.

In subgraph, we got some logic that we connect `execution` to the correct `proposal`.

</aside>

### Plugin setup in older release

**Feedback:** `PluginRepo` does not allow upgrading a release if a previous one exist do to this check?

```solidity
    if (version.tag.release != 0 && version.tag.release != _release) {
        revert PluginSetupAlreadyInPreviousRelease(
            version.tag.release,
            version.tag.build,
            _pluginSetup
        );
    }
```

<aside>
💡 **Response:** The following means you can't repeat the `PluginSetup` in more than one release.

if you're creating a release 3, you can only push `PluginSetup`s that have never been used in release 1 and 2.

But for sure, in the same release, you can repeat the same `PluginSetup`s.

</aside>

### Plugin Setup Processor

Why is the `PluginSetupProcessor` using the following lines under the `prepareInstallation`?

```solidity
    (plugin, preparedSetupData) = PluginSetup(version.pluginSetup).prepareInstallation(
        _dao,
        _params.data
    );

    bytes32 pluginInstallationId = _getPluginInstallationId(_dao, plugin);

```

Shouldn't the `_getPluginInstallationId` be using `version.pluginSetup` since the `prepareInstallation` will always generate a new proxy clone and the following line will never `revert`:

```solidity
    if (pluginState.currentAppliedSetupId != bytes32(0)) {
        revert PluginAlreadyInstalled();
    }

```

The `pluginInstallationId` will always be different for each call to `prepareInstallation`, even for same setup address.

<aside>
💡 **Response:**

1. if we use `PluginSetup`, it's tricky then, because in `prepareUpdate`, we won't know the exact `pluginAddress`.
2. More than 1 version might have the same `PluginSetup` address.

Those 2 reasons are why we use plugin instead.

To answer your 2nd question, we got that `revert`, because of stateful plugin scenario. What if calling `prepareInstallation` 2 times on the same `PluginSetup` returns the same `pluginAddress`es ? in this case, we need a `revert`.

</aside>

For the second question, that should be possible do to internal EVM nonce mechanism on `new`.

<aside>
💡 **Response:** Sometimes they won't use `new` to deploy plugins in `PluginSetup`.

</aside>

So covering some `CREATE2` pre-processing then..

<aside>
💡 **Response: T**here's an edge case where the same plugin must be returned. Imagine 2 DAOs. The plugin `creator` designed a plugin in a way that she/he doesn't want each DAO to have its own instance, but the exact same one.

So, she/he manually just returns the `address`, which is always the same.

</aside>

### Plugin Installation ID

**Feedback:** `_getPluginInstallationId` is based on the `DAO` address. Wouldn't it make sense to use that with the setup address as the ID and then have `pluginState` store the actual plugin address?

That way you can also check if there is a pending installation for that specific `PluginSetup`.

<aside>
💡 **Response:** It could, but the `PluginSetupProcessor` is a very complex beast, so it will hard to choose different way in this short amount of time.

</aside>

### Prepare installation

**Feedback:** There is nothing preventing me from calling `prepareInstallation` multiple times with the same data as the `prepareInstallation` on the `PluginSetup` will be giving me a totally different proxy address

<aside>
💡 **Response:** Yep, you can do it but what do you gain ? 😂

</aside>

Some fun 😂

<aside>
💡 **Response:** unless you call `applyInstallation`, subgraph and Aragon will never treat it as `installed` + `permissions` will never be applied on the `DAO`'s `PermissionManager`.

Maybe the test cases can help better design an attack here.

</aside>
