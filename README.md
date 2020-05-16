# Maven Publish Action

**GitHub Action for automatically publishing Maven packages**

## Overview

This action…

- Executes the Maven `deploy` lifecycle phase
- Provides Maven with your GPG key and passphrase so your artifacts can be signed using `maven-gpg-plugin`
- Provides Maven with your Nexus credentials so it can deploy and release your project

It will also use the `deploy` Maven profile if you've defined one (in case you want to perform certain steps only when deploying).

## Setup

### Deployment

It's recommended to publish using the Nexus Staging Maven Plugin, which greatly simplifies the process. You can follow [this guide](./docs/deployment-setup.md) for a simple configuration.

Make sure your project is correctly configured for deployment before continuing with the next step.

### Workflow

#### Secrets

In your project's GitHub repository, go to Settings → Secrets. On this page, set the following variables:

- `nexus_username`: Username (not email!) for your Nexus repository manager account
- `nexus_password`: Password for your Nexus account (or, even better, use the [auth token](https://solidsoft.wordpress.com/2015/09/08/deploy-to-maven-central-using-api-key-aka-auth-token/) instead)

Signing your artifact using GPG is optional, but recommended. If you choose to use GPG, add the following secrets:

- `gpg_private_key`: GPG private key for signing the published artifacts:
  - Run `gpg --list-secret-keys` and copy the ID of the key you'd like to use
  - Export the key with `gpg -a --export-secret-keys KEY_ID` (and replace `KEY_ID` with the ID you copied)
- `gpg_passphrase`: Passphrase for the GPG key

If you sign your artifacts, make sure the `maven-gpg-plugin` is configured as described [here](https://github.com/samuelmeuli/action-maven-publish/blob/master/docs/deployment-setup.md#project-configuration).

#### Workflow file

Create a GitHub workflow file (e.g. `.github/workflows/release.yml`) in your repository. Use the following configuration, which tells GitHub to use the Maven Publish Action when running your CI pipeline. The steps are self-explanatory:

```yml
name: Release

# Run workflow on commits to the `master` branch
on:
  push:
    branches:
      - master

jobs:
  release:
    runs-on: ubuntu-18.04
    steps:
      - name: Check out Git repository
        uses: actions/checkout@v2

      - name: Install Java and Maven
        uses: actions/setup-java@v1
        with:
          java-version: 11

      - name: Release Maven package
        uses: samuelmeuli/action-maven-publish@v1
        with:
          gpg_private_key: ${{ secrets.gpg_private_key }}
          gpg_passphrase: ${{ secrets.gpg_passphrase }}
          nexus_username: ${{ secrets.nexus_username }}
          nexus_password: ${{ secrets.nexus_password }}
```

The action will now run every time you push to `master`.

## Configuration

In addition to the input variables listed above, the action can be configured with the following options:

- **`directory`:** Directory of the Maven project to deploy. Default: Repository root
- **`maven_profiles`:** Active Maven profiles. Default: `"deploy"`
- **`maven_goals_phases`:** Maven goals and build phases to execute. Default: `"clean deploy"`
- **`maven_args`:** Additional arguments to pass to the Maven command. Default: `""`
- **`server_id`:** The default Nexus instance used by this action is OSSRH. If you are deploying to a different Nexus instance, you can specify the server ID you've used in your project's POM file (in the `nexus-staging-maven-plugin` and `distributionManagement` configurations) here

## Development

Suggestions and contributions are always welcome! Please discuss larger changes via issue before submitting a pull request.

## Related

- [Lint Action](https://github.com/samuelmeuli/lint-action) – GitHub Action for detecting and fixing linting errors
- [Electron Builder Action](https://github.com/samuelmeuli/action-electron-builder) – GitHub Action for building and releasing Electron apps
