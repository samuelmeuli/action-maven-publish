#!/usr/bin/env bash

# Make sure the required env variables are set
[ -z "$GPG_PRIVATE_KEY" ] && echo 'Missing "gpg_private_key" input variable' && exit 1;
[ -z "$GPG_PASSPHRASE" ] && echo 'Missing "gpg_passphrase" input variable' && exit 1;
[ -z "$NEXUS_USERNAME" ] && echo 'Missing "nexus_username" input variable' && exit 1;
[ -z "$NEXUS_PASSWORD" ] && echo 'Missing "nexus_password" input variable' && exit 1;
[ -z "$SERVER_ID" ] && echo 'Missing "server_id" input variable' && exit 1;

# Import GPG key from env variable into keychain
# Env variable is base64 encoded -> Decode it before import
echo $GPG_PRIVATE_KEY | base64 --decode | gpg --batch --import

# Deploy to Nexus
# The "deploy" profile is used in case the user wants to perform certain steps only during
# deployment and not in the install phase
cd $GITHUB_WORKSPACE
mvn clean deploy \
	--batch-mode \
	--activate-profiles deploy \
	--settings /settings.xml
