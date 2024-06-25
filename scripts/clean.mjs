#!/usr/bin/env zx
import Configstore from "configstore";
import clear from "clear";

$.verbose = false;

clear();
console.log(
  "Clean up config files, certs, ssh keys and Object Storage bucket..."
);

const projectName = "okeos";

const config = new Configstore(projectName, { projectName });

const privateKeyPath = config.get("privateKeyPath");
await $`rm -f ${privateKeyPath}`;
const publicKeyPath = config.get("publicKeyPath");
await $`rm -f ${publicKeyPath}`;

const certPath = path.join(__dirname, "..", ".certs");
await $`rm -rf ${certPath}`;

const backendApplicationYamlPath = "deploy/k8s/backend/application.yaml";
await $`rm -f ${backendApplicationYamlPath}`;
console.log(`Files in ${chalk.green(backendApplicationYamlPath)} deleted`);

const prodKustomizationPath = "deploy/k8s/overlays/prod/kustomization.yaml";
await $`rm -f ${prodKustomizationPath}`;
console.log(`Files in ${chalk.green(prodKustomizationPath)} deleted`);

const certsK8sPath = "deploy/k8s/ingress/.certs";
await $`rm -rf ${certsK8sPath}`;
console.log(`Files in ${chalk.green(certsK8sPath)} deleted`);

const artifactsPath = "./.artifacts";
await $`rm -rf ${artifactsPath}`;
console.log(`Files in ${chalk.green(artifactsPath)} deleted`);

config.clear();
