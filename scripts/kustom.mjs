#!/usr/bin/env zx
import Configstore from "configstore";
import clear from "clear";
import Mustache from "mustache";
import { exitWithError } from "./lib/utils.mjs";

$.verbose = false;

clear();
console.log("Create kustomization configuration...");

const projectName = "okeos";

const config = new Configstore(projectName, { projectName });

const compartmentId = config.get("compartmentId");
const namespace = config.get("namespace");
const regionName = config.get("regionName");
const regionKey = config.get("regionKey");
const backendVersion = config.get("backendVersion");
const certFullchain = config.get("certFullchain");
const certPrivateKey = config.get("certPrivateKey");

await createBackendProperties();
await createProdKustomization();
await copyCerts();

const namespaceName = "backend";
await createNamespace(namespaceName);
await createRegistrySecret(namespaceName);

async function createBackendProperties() {
  const backendPropertiesPath = "deploy/k8s/backend/application.yaml";

  const backendPropertiesTemplate = await fs.readFile(
    `${backendPropertiesPath}.mustache`,
    "utf-8"
  );

  const backendPropertiesOutput = Mustache.render(backendPropertiesTemplate, {
    region_name: regionName,
    compartment_ocid: compartmentId,
  });

  await fs.writeFile(backendPropertiesPath, backendPropertiesOutput);

  console.log(`File ${chalk.green(backendPropertiesPath)} created`);
}

async function createProdKustomization() {
  const prodKustomizationPath = "deploy/k8s/overlays/prod/kustomization.yaml";

  const prodKustomizationTemplate = await fs.readFile(
    `${prodKustomizationPath}.mustache`,
    "utf-8"
  );

  const prodKustomizationOutput = Mustache.render(prodKustomizationTemplate, {
    project_name: projectName,
    region_key: regionKey,
    tenancy_namespace: namespace,
    backend_version: backendVersion,
  });

  await fs.writeFile(prodKustomizationPath, prodKustomizationOutput);

  console.log(`File ${chalk.green(prodKustomizationPath)} created`);
}

async function copyCerts() {
  const ingressCertsPath = "deploy/k8s/ingress/.certs";
  await $`mkdir -p ${ingressCertsPath}`;
  await $`cp ${certFullchain} ${ingressCertsPath}/`;
  console.log(`File ${chalk.green(certFullchain)} copied`);
  await $`cp ${certPrivateKey} ${ingressCertsPath}/`;
  console.log(`File ${chalk.green(certPrivateKey)} copied`);
}

async function createNamespace(namespaceName = "default") {
  try {
    const { exitCode, stdout } =
      await $`KUBECONFIG="deploy/tf/generated/kubeconfig" \
        kubectl create ns ${namespaceName} -o yaml \
          --dry-run=client | \
          KUBECONFIG="deploy/tf/generated/kubeconfig" kubectl apply -f -`;
    if (exitCode !== 0) {
      exitWithError("namespace not created");
    } else {
      console.log(
        `Namespace ${chalk.green(
          namespaceName
        )} created on Kubernetes cluster: ${stdout}`
      );
    }
  } catch (error) {
    exitWithError(error.stderr);
  }
}

async function createRegistrySecret(namespaceName = "default") {
  const user = config.get("ocir_user");
  const email = config.get("ocir_user_email");
  const token = config.get("ocir_user_token");
  try {
    const { exitCode, stdout } =
      await $`KUBECONFIG="deploy/tf/generated/kubeconfig" kubectl \
        create secret docker-registry ocir-secret \
          --save-config \
          --dry-run=client \
          --docker-server=${regionKey}.ocir.io \
          --docker-username=${namespace}/${user} \
          --docker-password=${token} \
          --docker-email=${email} \
          -n ${namespaceName} \
          -o yaml | \
          KUBECONFIG="deploy/tf/generated/kubeconfig" kubectl apply -f -`;
    if (exitCode !== 0) {
      exitWithError("docker-registry ocir-secret secret not created");
    } else {
      console.log(
        `Secret ${chalk.green(
          "ocir-secret"
        )} created on Kubernetes cluster: ${stdout}`
      );
    }
  } catch (error) {
    exitWithError(error.stderr);
  }
}
