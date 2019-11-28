# Maven Publish GitHub Action

**GitHub Action for automatically publishing Maven packages**

It's recommended to publish using the [Nexus Staging Maven Plugin](https://github.com/sonatype/nexus-maven-plugins/tree/master/staging/maven-plugin), which greatly simplifies the process.

## Requirements

The following instructions assume that you've already configured your repository for deployment using the Nexus Staging Maven Plugin. If you haven't, you can read about how to do this [here](https://central.sonatype.org/pages/apache-maven.html).

In the plugin's configuration, you will probably want to set the following option to automatically deploy to the Central Repository after successfully staging on Nexus:

```xml
<plugin>
  <groupId>org.sonatype.plugins</groupId>
  <artifactId>nexus-staging-maven-plugin</artifactId>
  <!-- ... -->
  <configuration>
    <!-- ... -->
    <autoReleaseAfterClose>true</autoReleaseAfterClose>
  </configuration>
</plugin>
```

Furthermore, make sure your GPG plugin is configured like this:

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-gpg-plugin</artifactId>
  <version>1.6</version>
  <executions>
    <execution>
      <id>sign-artifacts</id>
      <phase>verify</phase>
      <goals>
        <goal>sign</goal>
      </goals>
    <configuration>
        <!-- Prevent `gpg` from using pinentry programs -->
        <gpgArguments>
          <arg>--pinentry-mode</arg>
          <arg>loopback</arg>
        </gpgArguments>
      </configuration>
    </execution>
  </executions>
</plugin>
```

## Usage

### Authentication

In your project's GitHub repository, go to Settings → Secrets. On this page, set the following variables:

- `gpg_private_key`: GPG private key for signing the published artifacts:
  - Run `gpg --list-secret-keys` and copy the ID of the key you'd like to use
  - Export the key with `gpg -a --export-secret-keys KEY_ID` (and replace `KEY_ID` with the ID you copied)
- `gpg_passphrase`: Passphrase for the GPG key
- `nexus_username`: Username (not email!) for your Nexus repository manager account
- `nexus_password`: Password for your Nexus account

These secrets will be provided to the action as environment variables, allowing it to perform the deployment for you.

### Action

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
        uses: actions/checkout@v1

      - name: Install Java and Maven
        uses: actions/setup-java@v1
        with:
          java-version: 11

      - name: Release Maven package
        uses: samuelmeuli/action-maven-publish@0.1.0
        with:
          gpg_private_key: ${{ secrets.gpg_private_key }}
          gpg_passphrase: ${{ secrets.gpg_passphrase }}
          nexus_username: ${{ secrets.nexus_username }}
          nexus_password: ${{ secrets.nexus_password }}
```

Every time you push to `master`, the action will be executed. If your `pom.xml` file contains a non-snapshot version tag and all tests pass, your package will automatically be deployed.

## Configuration

In addition to the input variables listed above, the action can be configured with the following variables:

- **`server_id`:** The default Nexus instance used by this action is OSSRH. If you are deploying to a different Nexus instance, you can pass in the server ID you've used in your project's POM file (in the `nexus-staging-maven-plugin` and `distributionManagement` configurations)
- **`maven_args`:** Additional flags/arguments to pass to the Maven deploy command

## Development

### Implementation

The Maven Publish GitHub Action works the following way:

- When imported from a CI workflow in your project, GitHub will look for this repository's [`action.yml`](./action.yml) file. This file tells GitHub to run the `index.js` script and to pass in the action's input variables (e.g. GPG key and Nexus login credentials).
- The script imports the GPG key and runs the Maven deploy command. Maven will use this repository's [`settings.xml`](./settings.xml) file, which instructs it to use the GPG passphrase and Nexus credentials from the provided input variables. Maven will also use the `deploy` profile if you've defined one (in case you want to perform certain steps only when deploying).

### Contributing

Suggestions and contributions are always welcome! Please discuss larger changes via issue before submitting a pull request.
