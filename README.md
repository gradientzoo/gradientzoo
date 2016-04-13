Gradientzoo
-----------

To start the development server, enter the following command:

```console
source bin/dev-env && go run main.go
```

If that doesn't work, you need to set up your development configuration, first
by copying the template:

```console
cp bin/dev-env.template bin/dev-env
```

Then fill in the information pointing to your PostgreSQL and AWS services, and
re-run the command above starting with ``source``.

First-Time Deployment
=====================

Before you get started, you'll need these things set up:

* Go
* Python
* PostgreSQL server (Heroku Postgres is what I use)
* AWS Credentials and an S3 bucket set up
* Google Container Engine cluster set up and CLI configured

Here's what we're going to do:

* Use the .template files in the repo to fill in cluster secrets & config files
* Make builds of both the API and the web frontend, and push those Docker images
* Send Kubernetes all of the configuration files it needs to spin up the cluster
* Open up the firewall to allow incoming traffic

**TODO:** *Finish writing this README*

Here are the commands you'll need to open up the firewall:

```console
export WWW_NODE_PORT=$(kubectl get -o jsonpath="{.spec.ports[0].nodePort}" services gradientzoo-web-svc)
export API_NODE_PORT=$(kubectl get -o jsonpath="{.spec.ports[0].nodePort}" services gradientzoo-api-svc)
export TAG=$(kubectl get nodes | awk '{print $1}' | tail -n +2 | grep -wo 'gke.*-node' | uniq)
gcloud compute firewall-rules create allow-130-211-0-0-22 \
  --source-ranges 130.211.0.0/22 \
  --target-tags $TAG \
  --allow tcp:$WWW_NODE_PORT,tcp:$API_NODE_PORT
```

Finally, you'll want to point your DNS entries to your new cluster, and then
you're set!