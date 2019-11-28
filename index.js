const { execSync } = require("child_process");
const path = require("path");

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
	// Import GPG key from env variable into keychain
	// Env variable is base64 encoded -> Decode it before import
	log("Importing GPG key…");
	run("echo $INPUT_GPG_PRIVATE_KEY | base64 --decode | gpg --batch --import");

	// Deploy to Nexus
	// The "deploy" profile is used in case the user wants to perform certain steps only during
	// deployment and not in the install phase
	log("Deploying the Maven project…");
	run(
		`mvn clean deploy --batch-mode --activate-profiles deploy --settings ${MAVEN_SETTINGS_PATH} $INPUT_MAVEN_ARGS`,
	);
};

runAction();
