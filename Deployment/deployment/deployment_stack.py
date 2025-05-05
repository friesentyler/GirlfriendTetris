import os
from dotenv import load_dotenv

from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    CfnOutput,
    aws_apigateway as apigateway,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    aws_iam as iam,
    aws_certificatemanager as acm,
    aws_dynamodb as dynamodb
)
import aws_cdk as cdk
from constructs import Construct

class CertStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        cert = acm.Certificate(self, "Certificate",
            domain_name="www.girlfriendtetris.com",
            subject_alternative_names=["girlfriendtetris.com"],
            validation=acm.CertificateValidation.from_dns()
        )

        CfnOutput(self, "CertificateArn", value=cert.certificate_arn, export_name="CertArn")



class DeploymentStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        load_dotenv()
        # this arn is loaded from the .env file. run the CertStack to get the arn which we then set the env to
        cert_arn = os.getenv("CERTIFICATE_ARN")
        cert = acm.Certificate.from_certificate_arn(self, "ImportedCert", cert_arn)

        # This gives the API Gateway the role necessary to access the S3 public
        # this way we don't need to make the S3 bucket public
        role = iam.Role(
            self, "ApiGatewayS3Role",
            assumed_by=iam.ServicePrincipal("apigateway.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("AmazonS3ReadOnlyAccess")
            ]
        )

        get_highscores_lambda = _lambda.Function(self, "GetHighscores",
            runtime=_lambda.Runtime.PYTHON_3_13,
            handler="index.handler",
            code=_lambda.Code.from_asset(os.path.join(os.path.dirname(__file__), "..", "..", "Lambdas/GetHighscores"))
        )

        temp_score_table = dynamodb.TableV2(self, "TempTable",
            partition_key=dynamodb.Attribute(name="pk", type=dynamodb.AttributeType.STRING),
            removal_policy=cdk.RemovalPolicy.DESTROY
        )

        high_score_table = dynamodb.TableV2(self, "HighscoreTable",
            partition_key=dynamodb.Attribute(name="pk", type=dynamodb.AttributeType.STRING),
            removal_policy=cdk.RemovalPolicy.DESTROY
        )
        high_score_table.grant_read_data(get_highscores_lambda)

        bucket = s3.Bucket(self, "gamefiles", enforce_ssl=True, removal_policy=cdk.RemovalPolicy.DESTROY, auto_delete_objects=True)

        s3deploy.BucketDeployment(self, "gamefilesDeployed",
            sources=[s3deploy.Source.asset("../Assets")],
            destination_bucket=bucket,
        )

        # defines the rest api, API Gateway only accepts the first type in the Accept header, which is why we have
        # non binary media types listed here. This allows us to properly serve our images and text content
        rest_api = apigateway.RestApi(self, "game-api",
            binary_media_types=["image/png", "text/css", "application/javascript", "text/html", "image/*", "application/octet-stream", "application/json"],
            deploy_options=apigateway.StageOptions(
                throttling_burst_limit=10,
                throttling_rate_limit=10,
                method_options={
                    "/highscores/GET": apigateway.MethodDeploymentOptions(
                        throttling_rate_limit=1,
                        throttling_burst_limit=3
                    )
                }
            ),
        )
        # specify the custom domain i.e. girlfriendtetris.com on the API gateway
        custom_domain = apigateway.DomainName(self, "CustomDomain",
            # I make it point to a subdomain because IONOS doesn't support apex CNAME records
            domain_name="www.girlfriendtetris.com",
            certificate=cert,
        )
        apigateway.BasePathMapping(self, "BasePathMapping",
            domain_name=custom_domain,
            rest_api=rest_api,
            stage=rest_api.deployment_stage
        )
        proxy_resource = rest_api.root.add_resource("{proxy+}")

        # sets up the proxy method, so we can grab any of the resources from the S3 bucket
        proxy_route = proxy_resource.add_method("GET", apigateway.AwsIntegration(
            service="s3",
            path=f"{bucket.bucket_name}/{{proxy}}",
            region="us-west-2",
            integration_http_method="GET",
            options=apigateway.IntegrationOptions(
                credentials_role=role,
                request_parameters={
                    "integration.request.path.proxy": "method.request.path.proxy"
                },
                integration_responses=[
                    apigateway.IntegrationResponse(
                        status_code="200",
                        selection_pattern="",
                        response_parameters={
                            "method.response.header.Content-Type": "integration.response.header.Content-Type"
                        }
                    ),
                    apigateway.IntegrationResponse(
                        status_code="400",
                        selection_pattern="4\\d{2}",
                        response_templates={"application/json": '{"error": "Client Error"}'}
                    ),
                    apigateway.IntegrationResponse(
                        status_code="500",
                        selection_pattern="5\\d{2}",
                        response_templates={"application/json": '{"error": "Server Error"}'}
                    )
                ]
            )
        ), request_parameters={
            "method.request.path.proxy": True
        }, method_responses=[
            apigateway.MethodResponse(
                status_code="200",
                response_parameters={
                    "method.response.header.Content-Type": True
                }
            ),
            apigateway.MethodResponse(status_code="400"),
            apigateway.MethodResponse(status_code="500"),
        ])

        # maps the default route of the application to index.html
        default_route = rest_api.root.add_method("GET", apigateway.AwsIntegration(
            service="s3",
            path=f"{bucket.bucket_name}/index.html",
            region="us-west-2",
            integration_http_method="GET",
            options=apigateway.IntegrationOptions(
                credentials_role=role,
                request_parameters={
                    "integration.request.path.proxy": "method.request.path.proxy"
                },
                integration_responses=[
                    apigateway.IntegrationResponse(
                        status_code="200",
                        selection_pattern="",
                        response_parameters={
                            "method.response.header.Content-Type": "integration.response.header.Content-Type"
                        }
                    ),
                    apigateway.IntegrationResponse(
                        status_code="400",
                        selection_pattern="4\\d{2}",
                        response_templates={"application/json": '{"error": "Client Error"}'}
                    ),
                    apigateway.IntegrationResponse(
                        status_code="500",
                        selection_pattern="5\\d{2}",
                        response_templates={"application/json": '{"error": "Server Error"}'}
                    )
                ]
            )
        ), request_parameters={
            "method.request.path.proxy": True
        }, method_responses=[
            apigateway.MethodResponse(
                status_code="200",
                response_parameters={
                    "method.response.header.Content-Type": True
                }
            ),
            apigateway.MethodResponse(status_code="400"),
            apigateway.MethodResponse(status_code="500"),
        ])


        # Create a dedicated /highscores resource
        highscores_resource = rest_api.root.add_resource("highscores")
        highscores_integration = apigateway.LambdaIntegration(get_highscores_lambda)
        highscores_method = highscores_resource.add_method(
            "GET",
            highscores_integration,
            method_responses=[
                apigateway.MethodResponse(status_code="200"),
                apigateway.MethodResponse(status_code="400"),
                apigateway.MethodResponse(status_code="500"),
            ]
        )

        CfnOutput(self, "Api Gateway", value=rest_api.url)
        CfnOutput(self, "CustomDomainTarget", value=custom_domain.domain_name_alias_domain_name)

