from aws_cdk import (
    # Duration,
    Stack,
    aws_lambda as _lambda,
    CfnOutput,
    HttpLambdaIntegration,
    HttpLambdaIntegration,
    aws_apigatewayv2 as apigwv2
    # aws_sqs as sqs,
)
from constructs import Construct

class DeploymentStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

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

        get_books_integration = HttpUrlIntegration("GetBooksIntegration", "https://get-books-proxy.example.com")
        book_store_default_integration = HttpLambdaIntegration("BooksIntegration", my_function)

        http_api = apigwv2.HttpApi(self, "HttpApi", 
            default_integration=HttpUrlIntegration("DefaultIntegration", "https://example.com")
        )

        http_api.add_routes(
            path="/",
            methods=[apigwv2.HttpMethod.GET],
            integration=get_books_integration
        )

        http_api.add_routes(
            path="/books",
            methods=[apigwv2.HttpMethod.ANY],
            integration=book_store_default_integration
        )

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
        )

        CfnOutput(self, "myFunctionUrlOutput", value=my_function_url.url)'''



        # example resource
        # queue = sqs.Queue(
        #     self, "DeploymentQueue",
        #     visibility_timeout=Duration.seconds(300),
        # )
