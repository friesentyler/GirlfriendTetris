import json
import boto3
import base64

dynamodb = boto3.resource('dynamodb')
temp_table = dynamodb.Table('DeploymentStack-TempTable85935BBC-FHUB9N780SFL')

def handler(event, context):
    try:
        raw_body = event.get("body", "")
        if event.get("isBase64Encoded", False):
            raw_body = base64.b64decode(raw_body).decode("utf-8")

        body = json.loads(raw_body)
        player_id = body.get("PlayerId")

        if not player_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing PlayerId in request body"})
            }

        response = temp_table.delete_item(Key={"pk": player_id})

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": f"Deleted record for PlayerId: {player_id}"
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

