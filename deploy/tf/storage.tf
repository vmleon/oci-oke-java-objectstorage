resource "oci_objectstorage_bucket" "artifacts_bucket" {
  compartment_id = var.compartment_ocid
  name           = "artifacts_${local.project_name}_${local.deploy_id}"
  namespace      = data.oci_objectstorage_namespace.objectstorage_namespace.namespace
}

resource "oci_objectstorage_object" "txt_object" {
  bucket    = oci_objectstorage_bucket.artifacts_bucket.name
  content   = "Hello World OKE!"
  namespace = data.oci_objectstorage_namespace.objectstorage_namespace.namespace
  object    = "hello.txt"
}