Gradientzoo
-----------

To start the development server, enter the following command:

```console
source bin/env && go run main.go
```

If that doesn't work, you need to set up your development configuration
starting from the provided template:

```console
cp bin/env.template bin/env
```

Make sure to fill in the blanks in the file ``bin/env``. (Mainly this means
entering your AWS credentials.)

If you want to connect to a remote postgres instead of running a local one
after you've deployed, run this command to forward the port:

```console
./bin/forward-ports
```

First-Time Deployment
=====================

Before you get started, you'll need these things set up:

* Go
* Python
* AWS Credentials and an S3 bucket set up
* Google Container Engine cluster set up and CLI configured

Here's what we're going to do:

* Use the .template files in the repo to fill in cluster secrets & config files
* Provision a disk for use by the database
* Make builds of both the API and the web frontend, and push those Docker images
* Send Kubernetes all of the configuration files it needs to spin up the cluster
* Create the database for use by the system
* Open up the firewall to allow incoming traffic

**TODO:** *Finish writing this README*

Here is the command to provision a disk for the database:
```console
gcloud compute disks create gradientzoo-postgres-disk --size 250GB
```

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

TODO
====

* Proper 404 page
* Link to readthedocs
* Show one or two extra params in list
* Add TOS and privacy policy
* Import common public domain datasets for popular libraries into a 'commons'
* Allow user to edit the name and description of their model
* Links from homepage to full model lists
* Infinite pagination on the full model lists
* Make the webapp universal
* Badge for projects on GitHub
* Log in with GitHub
* [ops] Switch to Google Cloud Storage rather than AWS for blob storage
* [ops] Set up an ElasticSearch, Logstash/Heka, Kibana (E[LH]K) stack