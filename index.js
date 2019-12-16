const { execSync } = require("child_process");
const { unlinkSync, writeFileSync } = require("fs");
const path = require("path");

const GPG_KEY_PATH = path.join(__dirname, "private-key.txt");
const MAVEN_SETTINGS_PATH = path.join(__dirname, "settings.xml");

/**
 * Logs to the console
 */
const log = msg => console.log(`\n${msg}`); // eslint-disable-line no-console

/**
 * Exits the current process with an error code and message
 */
const exit = msg => {
	console.error(msg);
	process.exit(1);
};

/**
 * Executes the provided shell command and redirects stdout/stderr to the console
 */
const run = (cmd, cwd) => execSync(cmd, { encoding: "utf8", stdio: "inherit", cwd });

/**
 * Returns the value for an environment variable (or `null` if it's not defined)
 */
const getEnv = name => process.env[name.toUpperCase()] || null;

/**
 * Returns the value for an input variable (or `null` if it's not defined). If the variable is
 * required and doesn't have a value, abort the action
 */
const getInput = (name, required) => {
	const value = getEnv(`INPUT_${name}`);
	if (required && !value) {
		exit(`"${name}" input variable is not defined`);
	}
	return value;
};

/**
 * Runs the deployment
 */
const runAction = () => {
	// Make sure the required input variables are provided
	getInput("gpg_passphrase", true);
	getInput("nexus_username", true);
	getInput("nexus_password", true);

	// Import GPG key into keychain
	log("Importing GPG key…");
	writeFileSync(GPG_KEY_PATH, getInput("gpg_private_key", true));
	run(`gpg --import --batch ${GPG_KEY_PATH}`);
	unlinkSync(GPG_KEY_PATH);

	// Deploy to Nexus
	// The "deploy" profile is used in case the user wants to perform certain steps only during
	// deployment and not in the install phase
	log("Deploying the Maven project…");
	run(
		`mvn clean deploy --batch-mode --activate-profiles deploy --settings ${MAVEN_SETTINGS_PATH} $INPUT_MAVEN_ARGS`,
		getInput("directory"),
	);
};

runAction();
