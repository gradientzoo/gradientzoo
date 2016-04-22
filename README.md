Gradientzoo
-----------

Gradientzoo is an open source website and API service for versioning and
sharing neural network model weights. This repo is essentially a monorepo,
filled with everything needed to run your own version of the site and service:

* A React website frontend, served by node.js
* An API service layer written in Go
* Dockerized versions of the above
* Kuberentes deployment configuration for spinning up the entire solution on
  Google Container Engine, including load balancing and a PostgreSQL database
* Development and deployment helper scripts
* Templates for configuration and environment variables


Features
========

Supports saving models in [Keras](http://keras.io/), variables in [Tensorflow](https://www.tensorflow.org), and networks in [Lasagne](http://lasagne.readthedocs.org/en/latest/), and regular old files using Python with your framework of choice.


Before you start
================

There are a number of files with secrets in them, which cannot be checked
into this repo.  Instead, we've provided template files for you to remove the
.template extension from and fill in the blanks:

* bin/env.template                             # Environment variables
* deploy/gradientzoo-api-cert.yml.template     # API domain SSL cert
* deploy/gradientzoo-web-cert.yml.template     # Web domain SSL cert
* deploy/gradientzoo-secret-aws.yml.template   # AWS credentials
* deploy/gradientzoo-secret-postgresql.yml.template # PostgreSQL credentials
* deploy/gradientzoo-secret-strip.yml.template # Stripe credentials


Contribute
==========

* Issue Tracker: https://github.com/gradientzoo/gradientzoo/issues
* Source Code: https://github.com/gradientzoo/gradientzoo


Development
===========

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


Support
=======

If you are having issues, please let us know at support@gradientzoo.com


First time deployment
=====================

Before you get started, you'll need these things set up:

* Go
* Python
* Google Container Engine cluster set up and CLI configured
* The template files above, filled in and ready to go

Here's what we're going to do:

* Provision a disk for use by the database
* Make builds for both the API and the web frontend, and push those Docker images
* Send Kubernetes all of the configuration files it needs to spin up the cluster
* Open up the firewall to allow incoming traffic

To provision the disk for use by the database, run the following command:

```console
gcloud compute disks create gradientzoo-postgres-disk --size 250GB
```

Now let's make builds for both the API and the web frontend, and push the
Docker images:

```console
./bin/rebuild-api
./bin/rebuild-web
```

Next, we send Kubernetes everything it needs to spin up the entire cluster:

```console
kubectl create -f deploy/
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
* Show one or two extra params in list
* Import common public domain datasets for popular libraries into a 'commons'
* Allow user to edit the name and description of their model
* Links from homepage to full model lists
* Infinite pagination on the full model lists
* Make the webapp universal
* Badge for projects on GitHub
* Log in with GitHub
* [ops] Switch to Google Cloud Storage rather than AWS for blob storage
* [ops] Set up an ElasticSearch, Logstash/Heka, Kibana (E[LH]K) stack