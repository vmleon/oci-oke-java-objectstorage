# OCI OKE Java Object Storage

Example based on [Example: Using the Java SDK to Grant Application Workloads Access to OCI Resources](https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contenggrantingworkloadaccesstoresources.htm#contengmanagingworkloads_topic-grantingworkloadaccesstoresources-java)

## Set environment

Select options for deployment:

```bash
zx scripts/setenv.mjs
```

Create tfvars file:

```bash
zx scripts/tfvars.mjs
```

```bash
cd ../..
```

## Set deployment

Build and push images:

```bash
zx scripts/release.mjs
```

Create Kustomization files:

```bash
zx scripts/kustom.mjs
```

### Kubernetes Deployment

```bash
export KUBECONFIG="$(pwd)/deploy/tf/generated/kubeconfig"
```

```bash
kubectl apply -k deploy/k8s/overlays/prod
```

Run `get deploy` a few times:

```bash
kubectl get deploy -n backend
```

Access your application:

```bash
echo $(kubectl get service \
  -n backend \
  -o jsonpath='{.items[?(@.spec.type=="LoadBalancer")].status.loadBalancer.ingress[0].ip}')
```

Test it with:

```bash
curl -k https://LB_PUBLIC_IP/api/os/ns
```

## Clean up

Delete Kubernetes components

```bash
kubectl delete -k deploy/k8s/overlays/prod
```

Destroy infrastructure with Terraform.

```bash
cd deploy/tf
```

```bash
terraform destroy -auto-approve
```

```bash
cd ../..
```

Clean up the artifacts on Object Storage

```bash
zx scripts/clean.mjs
```

## Local deployment

Run locally with these steps [Local](LOCAL.md)
