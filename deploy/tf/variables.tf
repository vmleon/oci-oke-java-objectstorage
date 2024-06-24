variable "tenancy_ocid" {
  type = string
}

variable "region" {
  type    = string
  default = "eu-frankfurt-1"
}

variable "compartment_ocid" {
  type = string
}

variable "cert_fullchain" {
  type = string
}

variable "cert_private_key" {
  type = string
}

variable "ssh_private_key_path" {
  type = string
}

variable "ssh_public_key" {
  type = string
}

variable "project_name" {
  type    = string
  default = "okeos"
}

variable "artifacts_par_expiration_in_days" {
  type    = number
  default = 7
}