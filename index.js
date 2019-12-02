const { execSync } = require("child_process");
const { unlinkSync, writeFileSync } = require("fs");
const path = require("path");

const GPG_KEY_PATH = path.join(__dirname, "private-key.pem");
const MAVEN_SETTINGS_PATH = path.join(__dirname, "settings.xml");

/**
 * Logs to the console
 */
const log = msg => console.log(`\n${msg}`); // eslint-disable-line no-console

/**
 * Executes the provided shell command and redirects stdout/stderr to the console
 */
const run = cmd => execSync(cmd, { encoding: "utf8", stdio: "inherit" });

/**
 * Runs the deployment
 */
const runAction = () => {
	// Import GPG key into keychain
	log("Importing GPG key…");
	writeFileSync(GPG_KEY_PATH, process.env.INPUT_GPG_PRIVATE_KEY);
	run(`gpg --import --batch ${GPG_KEY_PATH}`);
	unlinkSync(GPG_KEY_PATH);

	// Deploy to Nexus
	// The "deploy" profile is used in case the user wants to perform certain steps only during
	// deployment and not in the install phase
	log("Deploying the Maven project…");
	run(
		`mvn clean deploy --batch-mode --activate-profiles deploy --settings ${MAVEN_SETTINGS_PATH} $INPUT_MAVEN_ARGS`,
	);
};

runAction();
