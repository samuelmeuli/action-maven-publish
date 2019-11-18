#!/usr/bin/env bash

# Make sure the required env variables are set
[ -z "$GPG_PRIVATE_KEY" ] && echo 'Missing "gpg_private_key" input variable' && exit 1;
[ -z "$GPG_PASSPHRASE" ] && echo 'Missing "gpg_passphrase" input variable' && exit 1;
[ -z "$OSSRH_USERNAME" ] && echo 'Missing "ossrh_username" input variable' && exit 1;
[ -z "$OSSRH_PASSWORD" ] && echo 'Missing "ossrh_password" input variable' && exit 1;

# Import GPG key from env variable into keychain
# Env variable is base64 encoded -> Decode it before import
echo ${GPG_PRIVATE_KEY} | base64 --decode | gpg --batch --import

# Deploy to OSSRH, which will automatically release to Central Repository
mvn clean deploy \
	--batch-mode \
	--activate-profiles deploy \
	--settings ./settings.xml
