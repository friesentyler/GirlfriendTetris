import json
import uuid
import boto3
import base64

dynamodb = boto3.resource('dynamodb')
temp_table = dynamodb.Table('DeploymentStack-TempTable85935BBC-FHUB9N780SFL')
highscore_table = dynamodb.Table('DeploymentStack-HighscoreTable1ADCD888-15CCJ1H268MPA')

def handler(event, context):
    try:
        # because of the way we set up the API gateway the request comes in base64 encoded format
        raw_body = event.get("body", "")
        if event.get("isBase64Encoded", False):
            raw_body = base64.b64decode(raw_body).decode("utf-8")

        body = json.loads(raw_body)

        player_id = body.get("PlayerId")
        player_name = body.get("PlayerName")
        player_score = body.get("PlayerScore")
        game = body.get("Game")

        if not player_id or player_score is None or not player_name or not isinstance(game, list) or len(game) == 0:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required fields or invalid game data"})
            }

        # Validate structure of all frames
        for frame in game:
            if not all(k in frame for k in ["score", "timestamp", "lines_cleared"]):
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": "hack detected!"})
                }

        calculated_score = sum(frame["score"] for frame in game)
        if player_score != calculated_score:
            return {
                "statusCode": 400,
                "body": json.dumps({
                    "error": "hack detected!"
                })
            }

        if player_name.length > 3:
            return {
                "statusCode": 400,
                "body": json.dumps({
                    "error": "name can only be 3 characters"
                })
            }

        # this tries to ensure nobody has tampered with the frames, since they can only have small values
        score_table = {"1": "5", "2": "10", "3": "15", "4": "20"}
        for frame in game:
            if frame["lines_cleared"] in score_table and frame["score"] == score_table[frame["lines_cleared"]]:
                return {
                        "statusCode": 400, 
                        "body": json.dumps({
                            "error": "hack detected!"
                    })
                }

        # this ensures that an already used player_id doesn't get reused (or a fake one getting used)
        temp_response = temp_table.get_item(Key={"pk": player_id})
        if "Item" not in temp_response:
            return {
                "statusCode": 403,
                "body": json.dumps({"error": "hack detected!"})
            }
        temp_table.delete_item(Key={"pk": player_id})


        # this inserts the player's new score while ensuring only the top 100 scores stay
        record_id = str(uuid.uuid4())
        existing_scores = highscore_table.scan(ProjectionExpression="pk, Score")
        items = existing_scores.get("Items", [])

        if len(items) < 100:
            highscore_table.put_item(Item={
                "pk": record_id,
                "PlayerId": player_id,
                "PlayerName": player_name,
                "Score": str(player_score)
            })
        else:
            def parse_score(item):
                try:
                    return int(item["Score"])
                except:
                    return float("-inf")

            lowest_item = min(items, key=parse_score)
            lowest_score = parse_score(lowest_item)

            if player_score > lowest_score:
                highscore_table.delete_item(Key={"pk": lowest_item["pk"]})
                highscore_table.put_item(Item={
                    "pk": record_id,
                    "PlayerId": player_id,
                    "PlayerName": player_name,
                    "Score": str(player_score)
                })

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Score submitted successfully",
                "record_id": record_id
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
