const { execSync } = require("child_process");
const { unlinkSync, writeFileSync } = require("fs");
const path = require("path");

const gpgKeyPath = path.join(__dirname, "private-key.txt");
const mavenSettingsPath = path.join(__dirname, "settings.xml");

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
	getInput("nexus_username", true);
	getInput("nexus_password", true);

	// Import GPG key into keychain
	const privateKey = getInput("gpg_private_key");
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
		`mvn clean deploy --batch-mode --activate-profiles deploy --settings ${mavenSettingsPath} ${getInput(
			"maven_args",
		) || ""}`,
		getInput("directory"),
	);
};

runAction();
