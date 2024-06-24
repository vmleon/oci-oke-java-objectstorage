#!/usr/bin/env zx
import Configstore from "configstore";
import inquirer from "inquirer";
import clear from "clear";
import {
  getNamespace,
  getRegions,
  getTenancyId,
  searchCompartmentIdByName,
} from "./lib/oci.mjs";
import { createSSHKeyPair, createSelfSignedCert } from "./lib/crypto.mjs";

$.verbose = false;

clear();
console.log("Set up environment...");

const projectName = "okeos";

const config = new Configstore(projectName, { projectName });

await setTenancyEnv();
await setNamespaceEnv();
await setRegionEnv();
await setCompartmentEnv();
await createSSHKeys(projectName);
await createCerts();

console.log(`\nConfiguration file saved in: ${chalk.green(config.path)}`);

async function setTenancyEnv() {
  const tenancyId = await getTenancyId();
  config.set("tenancyId", tenancyId);
}

async function setNamespaceEnv() {
  const namespace = await getNamespace();
  config.set("namespace", namespace);
}

async function setRegionEnv() {
  const listSubscribedRegions = (await getRegions()).sort(
    (r1, r2) => r1.isHomeRegion > r2.isHomeRegion
  );

  if (listSubscribedRegions.length === 1) {
    config.set("regionName", listSubscribedRegions[0].name);
    config.set("regionKey", listSubscribedRegions[0].key);
  } else {
    await inquirer
      .prompt([
        {
          type: "list",
          name: "region",
          message: "Select the region",
          choices: listSubscribedRegions.map((r) => r.name),
          filter(val) {
            return listSubscribedRegions.find((r) => r.name === val);
          },
        },
      ])
      .then((answers) => {
        config.set("regionName", answers.region.name);
        config.set("regionKey", answers.region.key);
      });
  }
}

async function setCompartmentEnv() {
  await inquirer
    .prompt([
      {
        type: "input",
        name: "compartmentName",
        message: "Compartment Name",
        default() {
          return "root";
        },
      },
    ])
    .then(async (answers) => {
      const compartmentName = answers.compartmentName;
      const compartmentId = await searchCompartmentIdByName(
        compartmentName || "root"
      );
      config.set("compartmentName", compartmentName);
      config.set("compartmentId", compartmentId);
    });
}

async function createSSHKeys(name) {
  const sshPathParam = path.join(os.homedir(), ".ssh", name);
  const publicKeyContent = await createSSHKeyPair(sshPathParam);
  config.set("privateKeyPath", sshPathParam);
  config.set("publicKeyContent", publicKeyContent);
  config.set("publicKeyPath", `${sshPathParam}.pub`);
  console.log(`SSH key pair created: ${chalk.green(sshPathParam)}`);
}

async function createCerts() {
  const certPath = path.join(__dirname, "..", ".certs");
  await $`mkdir -p ${certPath}`;
  await createSelfSignedCert(certPath);
  config.set("certFullchain", path.join(certPath, "tls.crt"));
  config.set("certPrivateKey", path.join(certPath, "tls.key"));
}
