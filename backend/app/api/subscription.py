# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from typing import Literal, Optional
# from bson import ObjectId

# from app.services.graph_service import invoke
# from app.functions import subs_db

# router = APIRouter()


# # -------------------------
# # Request schema
# # -------------------------

# class SubscriptionReq(BaseModel):
#     user_id: str
#     new_plan_id: str
#     billing_cycle: Literal["monthly", "quarterly", "yearly"]
#     paid: bool
#     price: float
#     transaction_id: Optional[str] = None


# # -------------------------
# # Upgrade / Subscribe
# # -------------------------

# @router.post("/upgrade")
# def upgrade_subscription(req: SubscriptionReq):
#     # Validate user_id
#     try:
#         ObjectId(req.user_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid user_id")

#     payload = {
#         "start_at": "subscription_plan",
#         "flag": "yes",
#         "new_plan_id": req.new_plan_id,
#         "user_id": req.user_id,
#         "billing_cycle": req.billing_cycle,
#         "paid": req.paid,
#         "price": req.price,
#         "transaction_id": req.transaction_id,
#     }

#     result = invoke(payload)

#     # --- Streamlit-style DB fallback ---
#     wrote = False
#     try:
#         if subs_db is not None:
#             rec = subs_db.subscriptions.find_one({"user_id": req.user_id})
#             if rec and rec.get("plan_id") == req.new_plan_id:
#                 wrote = True
#     except Exception:
#         pass

#     if result.get("subscription_status") == "subscribed" or wrote:
#         return {
#             "flag": "yes",
#             "subscription_status": "subscribed",
#             "plan_id": req.new_plan_id,
#         }

#     raise HTTPException(
#         status_code=400,
#         detail=result.get("message", "Subscription update failed"),
#     )


from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal, Optional
from bson import ObjectId

from app.services.graph_service import invoke
from app.functions import subs_db, compute_price_for_cycle

router = APIRouter()


# -------------------------
# PRICE PREVIEW
# -------------------------

class PricePreviewReq(BaseModel):
    plan_id: str
    billing_cycle: Literal["monthly", "quarterly", "yearly"]


@router.post("/price")
def preview_price(req: PricePreviewReq):
    """
    Streamlit-equivalent price calculation.
    """
    try:
        price_info = compute_price_for_cycle(
            req.plan_id,
            req.billing_cycle,
        )

        return {
            "final_price": price_info["final_price"],
            "raw_total": price_info["raw_total"],
            "discount_pct": price_info["discount_pct"],
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# -------------------------
# UPGRADE / SUBSCRIBE
# -------------------------

class SubscriptionReq(BaseModel):
    user_id: str
    new_plan_id: str
    billing_cycle: Literal["monthly", "quarterly", "yearly"]
    paid: bool
    price: float
    transaction_id: Optional[str] = None


@router.post("/upgrade")
def upgrade_subscription(req: SubscriptionReq):
    try:
        ObjectId(req.user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")

    payload = {
        "start_at": "subscription_plan",
        "flag": "yes",
        "new_plan_id": req.new_plan_id,
        "user_id": req.user_id,
        "billing_cycle": req.billing_cycle,
        "paid": req.paid,
        "price": req.price,
        "transaction_id": req.transaction_id,
    }

    result = invoke(payload)

    # fallback check
    wrote = False
    try:
        if subs_db is not None:
            rec = subs_db.subscriptions.find_one({"user_id": req.user_id})
            if rec and rec.get("plan_id") == req.new_plan_id:
                wrote = True
    except Exception:
        pass

    if result.get("subscription_status") == "subscribed" or wrote:
        return {
            "flag": "yes",
            "subscription_status": "subscribed",
            "plan_id": req.new_plan_id,
        }

    raise HTTPException(
        status_code=400,
        detail=result.get("message", "Subscription update failed"),
    )
