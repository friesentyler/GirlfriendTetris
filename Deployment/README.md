# IMPORTANT

In order to deploy this application if you pulled down from the GirlfriendTetris repo you need to initialize
a cdk application by running `cdk init` in the terminal under the `Deployment` folder. For more info look at
this guide from AWS 

make sure that the IAM user you use to initiate this process has the necessary permissions. Otherwise you will
continue to get permission denied errors. You can look up "IAM permissions for CDK bootstrap"

https://docs.aws.amazon.com/cdk/v2/guide/hello_world.html#hello_world_create

(although for a quick rundown after that you will need to run `cdk bootstrap` assuming you don't have an already
existing CDKToolkit stack and then run `cdk synth` then finally `cdk deploy`, to destroy the stack run `cdk destroy`)

You will want to deploy the two stacks separately, one generates the certificate "CertStack" and one provisions the resources
"DeploymentStack". After deploying CertStack via `cdk deploy CertStack` you will need to update the `CERTIFICATE_ARN` in the .env
file so that it matches 

but before the deployment finishes you will need to add a CNAME record to IONOS (delete the old one if it exists, do it
for the apex domain and the www one) manually. While the cdk deploy is still running navigate to ACM in AWS and copy 
the CNAME name and CNAME value. Go back to IONOS and use these in a new CNAME record. The cdk stack should finish 
deploying and say that the certificate was issued. However, you will only have to do this once when you initially deploy 
the CertStack. From then on only deploy the DeploymentStack.

When you run the DeploymentStack it should spit out a custom domain target. We need a CNAME record in ionos with host set to
"www" with the value set to the output from the DeploymentStack. this should theoretically not change between deployments.
Also we need a redirect record in IONOS to forward traffic from girlfriendtetris.com to www.girlfriendtetris.com. This is because
IONOS doesn't support apex CNAME records, so we have a bit of redirection hell.

# Welcome to your CDK Python project!

This is a blank project for CDK development with Python.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

This project is set up like a standard Python project.  The initialization
process also creates a virtualenv within this project, stored under the `.venv`
directory.  To create the virtualenv it assumes that there is a `python3`
(or `python` for Windows) executable in your path with access to the `venv`
package. If for any reason the automatic creation of the virtualenv fails,
you can create the virtualenv manually.

To manually create a virtualenv on MacOS and Linux:

```
$ python3 -m venv .venv
```

After the init process completes and the virtualenv is created, you can use the following
step to activate your virtualenv.

```
$ source .venv/bin/activate
```

If you are a Windows platform, you would activate the virtualenv like this:

```
% .venv\Scripts\activate.bat
```

Once the virtualenv is activated, you can install the required dependencies.

```
$ pip install -r requirements.txt
```

At this point you can now synthesize the CloudFormation template for this code.

```
$ cdk synth
```

To add additional dependencies, for example other CDK libraries, just add
them to your `setup.py` file and rerun the `pip install -r requirements.txt`
command.

## Useful commands

 * `cdk ls`          list all stacks in the app
 * `cdk synth`       emits the synthesized CloudFormation template
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk docs`        open CDK documentation

Enjoy!
