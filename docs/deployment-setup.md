# Deployment Setup

**Releasing your Maven project on the Central Repository can be somewhat complicated. One simple way to perform the deployment is using Sonatype's OSS Repository Hosting (OSSRH) platform and the corresponding Maven plugin.**

You can deploy your project on this Nexus instance, which will run a series of checks on your artifacts. If these checks pass, Nexus can automatically publish your project on the Central Repository.

The Maven Deploy Plugin is _not_ required with this setup.

## Requesting a Repository

_This guide assumes that you want to publish an open-source project to the Central Repository and that you'll be using Sonatype OSSRH for staging. If you want to publish to your own Nexus instance instead, this step will be different for you._

To be able to deploy to the Central Repository using Sonatype, you will need an account first. You can create one [here](https://issues.sonatype.org/secure/Signup!default.jspa).

Next, you will need to request a repository for your project on OSSRH. You can do this [here](https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134). After providing the required information and opening the ticket, you'll need to wait for one of the maintainers to verify and approve your request. This might take a day or two.

During the wait, you can continue following the steps below to make your project ready for deployment.

## GPG Key

To sign your releases on the Central Repository, you'll need a GPG key. Creating one is easy:

```sh
# On macOS, you will need to install `gnupg` first
brew install gnupg

# Generate a new GPG key
gpg --gen-key
```

Answer the prompts and set a passphrase. Next, run the following command to list your keys:

```sh
gpg --list-keys
```

Find your new key in the list and copy its ID. Send your public key to a key server:

```sh
gpg --keyserver hkps://keys.openpgp.org --send-keys KEY_ID
```

## Project Configuration

To configure your Maven project for deployment to OSSRH, add the following sections to your `pom.xml` file. You'll add a `deploy` profile, which is executed in the `deploy` lifecycle phase. It includes the `maven-source-plugin` for generating source JAR files, the `maven-javadoc-plugin` for including the Javadocs and the `maven-gpg-plugin` for signing your artifacts. You'll also configure the remote repository (`ossrh`):

```xml
<project>
  <profiles>
    <!-- Deployment profile (required so these plugins are only used when deploying) -->
    <profile>
      <id>deploy</id>
      <build>
        <plugins>
          <!-- Source plugin -->
          <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-source-plugin</artifactId>
            <version>2.4</version>
            <executions>
              <execution>
                <id>attach-sources</id>
                <goals>
                  <goal>jar-no-fork</goal>
                </goals>
              </execution>
            </executions>
          </plugin>

          <!-- Javadoc plugin -->
          <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-javadoc-plugin</artifactId>
            <version>2.10.4</version>
            <executions>
              <execution>
                <id>attach-javadocs</id>
                <goals>
                  <goal>jar</goal>
                </goals>
              </execution>
            </executions>
          </plugin>

          <!-- GPG plugin -->
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
        </plugins>
      </build>
    </profile>
  </profiles>

  <build>
    <plugins>
      <!-- Nexus Staging Plugin -->
      <plugin>
        <groupId>org.sonatype.plugins</groupId>
        <artifactId>nexus-staging-maven-plugin</artifactId>
        <version>1.6.8</version>
        <extensions>true</extensions>
        <configuration>
          <serverId>ossrh</serverId>
          <nexusUrl>https://oss.sonatype.org/</nexusUrl>
          <autoReleaseAfterClose>false</autoReleaseAfterClose>
        </configuration>
      </plugin>
    </plugins>
  </build>

  <distributionManagement>
    <!-- Central Repository -->
    <snapshotRepository>
      <id>ossrh</id>
      <url>https://oss.sonatype.org/content/repositories/snapshots</url>
    </snapshotRepository>
  </distributionManagement>
</project>
```

## Sources

- Sonatype docs ([1](https://central.sonatype.org/pages/apache-maven.html), [2](https://central.sonatype.org/pages/ossrh-guide.html), [3](https://central.sonatype.org/pages/working-with-pgp-signatures.html))
- [Publishing Artifact to Maven Central](https://itnext.io/publishing-artifact-to-maven-central-b160634e5268)
