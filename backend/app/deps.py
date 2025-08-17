from fastapi import Depends
# MVP のため、固定のダミーユーザーを返す。Cognito/JWT に置換予定
async def get_current_user_id() -> str:
    return "00000000-0000-0000-0000-000000000001"
