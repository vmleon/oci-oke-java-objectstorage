#!/usr/bin/env zx
import Configstore from "configstore";
import clear from "clear";
import {
  buildJarGradle,
  cleanGradle,
  getVersionGradle,
} from "./lib/gradle.mjs";
import {
  buildImage,
  tagImage,
  pushImage,
  checkPodmanMachineRunning,
  containerLogin,
} from "./lib/container.mjs";
import { getOutputValues } from "./lib/terraform.mjs";

$.verbose = false;

clear();
console.log("Build and push images to OCIR...");

const projectName = "okeos";

const config = new Configstore(projectName, { projectName });

const namespace = config.get("namespace");
const regionKey = config.get("regionKey");

const pwdOutput = (await $`pwd`).stdout.trim();
await cd(`${pwdOutput}/backend`);
const backendVersion = await getVersionGradle();
config.set("backendVersion", backendVersion);
await cd(pwdOutput);

await checkPodmanMachineRunning();

const ocirUrl = `${regionKey}.ocir.io`;

// FIXME use OCI Vault for the token
const { ocir_user, ocir_user_token, ocir_user_email } = await getOutputValues(
  "./deploy/tf"
);
config.set("ocir_user", ocir_user);
config.set("ocir_user_email", ocir_user_email);
config.set("ocir_user_token", ocir_user_token);

await containerLogin(namespace, ocir_user, ocir_user_token, ocirUrl);
await releaseBackend();

async function releaseBackend() {
  const service = "backend";
  await cd(service);
  await cleanGradle();
  await buildJarGradle();
  const currentVersion = await getVersionGradle();
  const imageName = `${projectName}/${service}`;
  await buildImage(`localhost/${imageName}`, currentVersion);
  const localImage = `localhost/${imageName}:${currentVersion}`;
  const remoteImage = `${ocirUrl}/${namespace}/${imageName}:${currentVersion}`;
  await tagImage(localImage, remoteImage);
  await pushImage(remoteImage);
  console.log(`${chalk.green(remoteImage)} pushed`);
  await cd("..");
}
