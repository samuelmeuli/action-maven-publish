#!/usr/bin/env bash

# Make sure the required env variables are set
[ -z "$gpgPrivateKey" ] && echo '"gpgPrivateKey" variable not set' && exit 1;
[ -z "$gpgPassphrase" ] && echo '"gpgPassphrase" env variable not set' && exit 1;
[ -z "$ossrhUsername" ] && echo '"ossrhUsername" env variable not set' && exit 1;
[ -z "$ossrhPassword" ] && echo '"ossrhPassword" env variable not set' && exit 1;

# Import GPG key from env variable into keychain
# Env variable is base64 encoded -> Decode it before import
echo ${gpgPrivateKey} | base64 --decode | gpg --batch --import

# Deploy to OSSRH, which will automatically release to Central Repository
mvn clean deploy \
	--batch-mode \
	--activate-profiles deploy \
	--settings ./settings.xml
