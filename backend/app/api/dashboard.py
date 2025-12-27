# from fastapi import APIRouter, HTTPException
# from bson import ObjectId
# from datetime import datetime, timezone

# from app.functions import (
#     Login_Form_Get_User_Subscription_Func,
#     get_user_usage,
#     users_db,
#     subs_db,
# )

# router = APIRouter()


# def compute_days_left(expires_at):
#     try:
#         if not expires_at:
#             return None
#         if not isinstance(expires_at, datetime):
#             expires_at = datetime.fromisoformat(str(expires_at))
#         if expires_at.tzinfo is None:
#             expires_at = expires_at.replace(tzinfo=timezone.utc)

#         now = datetime.now(timezone.utc)
#         delta = expires_at - now
#         return max(0, int(delta.total_seconds() // 86400))
#     except Exception:
#         return None


# @router.get("/{user_id}")
# def dashboard(user_id: str):
#     try:
#         oid = ObjectId(user_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid user_id")

#     user = users_db.users.find_one({"_id": oid})
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     subscription = Login_Form_Get_User_Subscription_Func(user_id)
#     usage = get_user_usage(user_id)

#     # 🔹 EXTRA: subscription validity (Streamlit equivalent)
#     expires_at = None
#     days_left = None
#     try:
#         rec = subs_db.subscriptions.find_one(
#             {"user_id": user_id},
#             {"_id": 0, "expires_at": 1, "ends_at": 1},
#         )
#         if rec:
#             expires_at = rec.get("expires_at") or rec.get("ends_at")
#             days_left = compute_days_left(expires_at)
#     except Exception:
#         pass

#     return {
#         "user": {
#             "full_name": user.get("full_name"),
#             "email": user.get("email"),
#             "user_type": user.get("user_type", "patient"),
#         },
#         "subscription": subscription,
#         "usage": usage,
#         "validity": {
#             "expires_at": expires_at,
#             "days_left": days_left,
#         },
#     }


from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional

from app.functions import (
    Login_Form_Get_User_Subscription_Func,
    get_user_usage,
    users_db,
    subs_db,
)

router = APIRouter()


# -------------------------
# Helpers
# -------------------------

def compute_days_left(expires_at) -> Optional[int]:
    """
    Returns number of days left (integer) or None
    """
    try:
        if not expires_at:
            return None

        if not isinstance(expires_at, datetime):
            expires_at = datetime.fromisoformat(str(expires_at))

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        now = datetime.now(timezone.utc)
        delta = expires_at - now
        return max(0, int(delta.total_seconds() // 86400))
    except Exception:
        return None


# -------------------------
# Dashboard API
# -------------------------

@router.get("/{user_id}")
def dashboard(user_id: str):
    # Validate user id
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")

    # Fetch user
    user = users_db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # SINGLE SOURCE OF TRUTH
    subscription_out = Login_Form_Get_User_Subscription_Func(user_id) or {}
    subscription = subscription_out.get("subscription", {})

    usage_out = get_user_usage(user_id) or {}
    usage = usage_out.get("usage", {})

    # -------------------------
    # Subscription validity
    # -------------------------

    expires_at = None
    days_left = None

    try:
        rec = subs_db.subscriptions.find_one(
            {"user_id": user_id},
            {"_id": 0, "expires_at": 1, "ends_at": 1},
        )
        if rec:
            expires_at = rec.get("expires_at") or rec.get("ends_at")
            days_left = compute_days_left(expires_at)
    except Exception:
        pass

    # -------------------------
    # Normalize response
    # -------------------------

    return {
        "user": {
            "id": user_id,
            "full_name": user.get("full_name") or user.get("name") or "User",
            "email": user.get("email"),
            "user_type": user.get("user_type", "patient"),
        },
        "subscription": {
            "plan_id": subscription.get("plan_id", "free"),
            "plan_name": subscription.get("plan_name", "Free"),
            "usage_limit": subscription.get("usage_limit", 0),
            "expires_at": expires_at,
            "days_left": days_left,
        },
        "usage": {
            "current_usage": usage.get("current_usage", 0),
        },
    }
