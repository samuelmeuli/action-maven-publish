const { execSync } = require("child_process");
const { unlinkSync, writeFileSync } = require("fs");
const path = require("path");

const gpgKeyPath = path.join(__dirname, "private-key.txt");
const mavenSettingsPath = path.join(__dirname, "settings.xml");

/**
 * Logs to the console
 * @param msg {string}: Text to log to the console
 */
function log(msg) {
	console.log(msg); // eslint-disable-line no-console
}

/**
 * Executes the provided shell command and redirects stdout/stderr to the console
 * @param cmd {string}: Shell command to execute
 * @param cwd {string | null}: Directory in which the command should be run
 * @returns {Buffer | string}: The stdout from the command
 */
function run(cmd, cwd = null) {
	return execSync(cmd, { encoding: "utf8", stdio: "inherit", cwd });
}

/**
 * Returns the value for an environment variable
 * @param name {string}: Name of the environment variable
 * @returns {string | undefined}: Value of the environment variable
 */
function getEnv(name) {
	return process.env[name];
}

/**
 * Returns the value for an input variable. If the variable is required and doesn't have a value,
 * abort the action
 * @param name {string}: Name of the input variable
 * @param required {boolean}: If set to true, the action will exit if the variable is not defined
 * @returns {string | null}: Value of the input variable
 */
function getInput(name, required = false) {
	const value = getEnv(`INPUT_${name.toUpperCase()}`);
	if (value == null) {
		// Value is either not set (`undefined`) or set to `null`
		if (required) {
			throw new Error(`"${name}" input variable is not defined`);
		}
		return null;
	}
	return value;
}

/**
 * Deploys the Maven project
 */
function runAction() {
	// Make sure the required input variables are provided
	getInput("nexus_username", true);
	getInput("nexus_password", true);

	const mavenArgs = getInput("maven_args", true);
	const mavenGoalsPhases = getInput("maven_goals_phases", true);
	const mavenProfiles = getInput("maven_profiles", true);

	// Import GPG key into keychain
	const privateKey = getInput("gpg_private_key").trim();
	if (privateKey) {
		// Make sure passphrase is provided
		getInput("gpg_passphrase", true);

		// Import private key (write into temporary file and import that file)
		log("Importing GPG key…");
		writeFileSync(gpgKeyPath, privateKey);
		run(`gpg --import --batch ${gpgKeyPath}`);
		unlinkSync(gpgKeyPath);
	}

	// Deploy to Nexus
	// The "deploy" profile is used in case the user wants to perform certain steps only during
	// deployment and not in the install phase
	log("Deploying the Maven project…");
	run(
		`mvn ${mavenGoalsPhases} --batch-mode --activate-profiles ${mavenProfiles} --settings ${mavenSettingsPath} ${mavenArgs}`,
		getInput("directory") || null,
	);
}

runAction();
