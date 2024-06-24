locals {
  oke_policy_name         = "${local.project_name}${local.deploy_id}-oke"
  ocir_group_name         = "${local.project_name}${local.deploy_id}-group"
}

resource "oci_identity_policy" "allow-oke-os-policy" {
  provider       = oci.home
  compartment_id = var.tenancy_ocid
  name           = "${local.oke_policy_name}"
  description    = "Allow OKE workload to manage Object Storage ${local.oke_policy_name}"
  statements = [
    "Allow any-user to manage objects in tenancy where all { request.principal.type = 'workload', request.principal.namespace = 'backend', request.principal.service_account = 'oci-service-account', request.principal.cluster_id = '${module.oke.cluster_id}'}"
  ]
}

resource "oci_identity_group" "ocir_group" {
  provider       = oci.home
  compartment_id = var.tenancy_ocid
  description    = "OCIR group users for ${local.project_name}${local.deploy_id}"
  name           = local.ocir_group_name
}

resource "oci_identity_user" "ocir_user" {
  provider       = oci.home
  compartment_id = var.tenancy_ocid
  description    = "User for pushing images to OCIR"
  name           = "${local.project_name}${local.deploy_id}-ocir-user"

  email = "${local.project_name}${local.deploy_id}-ocir-user@example.com"
}

resource "oci_identity_user_group_membership" "ocir_user_group_membership" {
  provider = oci.home
  group_id = oci_identity_group.ocir_group.id
  user_id  = oci_identity_user.ocir_user.id
}

resource "oci_identity_auth_token" "ocir_user_auth_token" {
  provider    = oci.home
  description = "User Auth Token to publish images to OCIR"
  user_id     = oci_identity_user.ocir_user.id
}

resource "oci_identity_policy" "manage_ocir_compartment" {
  provider       = oci.home
  compartment_id = var.tenancy_ocid
  name           = "manage_ocir_in_compartment_for_${local.project_name}${random_string.deploy_id.result}"
  description    = "Allow group to manage ocir at compartment level for ${local.project_name} ${random_string.deploy_id.result}"
  statements = [
    "allow group ${local.ocir_group_name} to manage repos in tenancy",
  ]
}
