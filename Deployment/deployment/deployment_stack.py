from aws_cdk import (
    # Duration,
    Stack,
    aws_lambda as _lambda,
    CfnOutput,
    aws_apigateway as apigateway,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    aws_iam as iam
    # aws_sqs as sqs,
)
import aws_cdk as cdk
from constructs import Construct
#from aws_cdk.aws_apigatewayv2_integrations import HttpLambdaIntegration
#from aws_cdk.aws_apigatewayv2_integrations import HttpUrlIntegration

class DeploymentStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        role = iam.Role(
            self, "ApiGatewayS3Role",
            assumed_by=iam.ServicePrincipal("apigateway.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("AmazonS3ReadOnlyAccess")
            ]
        )

        my_function = _lambda.Function(
            self, "HelloWorldFunction",
            runtime = _lambda.Runtime.NODEJS_20_X,
            handler = "index.handler",
            code = _lambda.Code.from_inline(
                """
                exports.handler = async function(event) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify('Hello CDK!'),
                    };
                };
                """
            ),
        )

        bucket = s3.Bucket(self, "gamefiles", enforce_ssl=True, removal_policy=cdk.RemovalPolicy.DESTROY, auto_delete_objects=True)

        s3deploy.BucketDeployment(self, "gamefilesDeployed",
            sources=[s3deploy.Source.asset("../Assets")],
            destination_bucket=bucket,
        )

        rest_api = apigateway.RestApi(self, "game-api",
            binary_media_types=["image/png", "text/css", "application/javascript", "text/html", "image/*", "application/octet-stream", "application/json"]
        )
        #resource = rest_api.root.add_resource("{proxy+}")
        #resource = rest_api.root.add_resource("index.html")
        '''resource.add_method("GET", apigateway.AwsIntegration(
            service="s3",
            path=f"{bucket.bucket_name}/index.html",
            integration_http_method="GET",
            options=apigateway.IntegrationOptions(
                credentials_role=role
            ),
            proxy=True
        ))'''

        proxy_resource = rest_api.root.add_resource("{proxy+}")

        proxy_resource.add_method("GET", apigateway.AwsIntegration(
            service="s3",
            path=f"{bucket.bucket_name}/{{proxy}}",
            region="us-west-2",  # your region here
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



        '''rest_api.add_usage_plan("UsagePlan",
            name="default",
            throttle=apigateway.ThrottleSettings(rate_limit=10, burst_limit=2)
        )'''

        '''get_gamefiles = HttpUrlIntegration("gamefilesStaticIntegration", bucket.virtual_hosted_url_for_object(key="index.html"))
        book_store_default_integration = HttpLambdaIntegration("BooksIntegration", my_function)

        http_api = apigwv2.HttpApi(self, "HttpApi", 
            default_integration=HttpUrlIntegration("DefaultIntegration", "https://example.com")
        )

        http_api.add_routes(
            path="/",
            methods=[apigwv2.HttpMethod.GET],
            integration=get_gamefiles
        )

        http_api.add_routes(
            path="/books",
            methods=[apigwv2.HttpMethod.ANY],
            integration=book_store_default_integration
        )'''

        '''my_function = _lambda.Function(
            self, "HelloWorldFunction",
            runtime = _lambda.Runtime.NODEJS_20_X,
            handler = "index.handler",
            code = _lambda.Code.from_inline(
                """
                exports.handler = async function(event) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify('Hello CDK!'),
                    };
                };
                """
            ),
        )

        my_function_url = my_function.add_function_url(
            auth_type = _lambda.FunctionUrlAuthType.NONE,
        )'''

        CfnOutput(self, "Api Gateway", value=rest_api.url)



        # example resource
        # queue = sqs.Queue(
        #     self, "DeploymentQueue",
        #     visibility_timeout=Duration.seconds(300),
        # )
