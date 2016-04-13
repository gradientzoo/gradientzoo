Gradientzoo
-----------

To start the server, enter the following command:

```console
go run main.go
```

First-time Deployment
=====================

```console
export WWW_NODE_PORT=$(kubectl get -o jsonpath="{.spec.ports[0].nodePort}" services gradientzoo-web-svc)
export API_NODE_PORT=$(kubectl get -o jsonpath="{.spec.ports[0].nodePort}" services gradientzoo-api-svc)
export TAG=$(kubectl get nodes | awk '{print $1}' | tail -n +2 | grep -wo 'gke.*-node' | uniq)
gcloud compute firewall-rules create allow-130-211-0-0-22 \
  --source-ranges 130.211.0.0/22 \
  --target-tags $TAG \
  --allow tcp:$WWW_NODE_PORT,tcp:$API_NODE_PORT
```