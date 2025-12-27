# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from typing import Literal
# from bson import ObjectId

# from app.services.graph_service import invoke

# router = APIRouter()


# # -------------------------
# # Request schema
# # -------------------------

# class FeatureReq(BaseModel):
#     user_id: str
#     selection: Literal["image", "report"]


# # -------------------------
# # Use feature
# # -------------------------

# @router.post("/use")
# def use_feature(req: FeatureReq):
#     # Validate user_id
#     try:
#         ObjectId(req.user_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid user_id")

#     payload = {
#         "start_at": "user_selection",
#         "flag": "yes",
#         "selection": req.selection,
#         "user_id": req.user_id,
#     }

#     result = invoke(payload)

#     task = result.get("task")

#     if task in ("image_done", "report_done"):
#         return {
#             "flag": "yes",
#             "task": task,
#         }

#     raise HTTPException(
#         status_code=400,
#         detail=result.get("message", "Failed to use feature"),
#     )


# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from typing import Literal
# from bson import ObjectId

# from app.services.graph_service import invoke

# router = APIRouter(prefix="/feature", tags=["Feature"])


# # =====================================================
# # Request schema (MATCHES FRONTEND)
# # =====================================================

# class FeatureReq(BaseModel):
#     user_id: str
#     feature: Literal["image", "report"]


# # =====================================================
# # Use feature
# # =====================================================

# @router.post("/use")
# def use_feature(req: FeatureReq):
#     """
#     Entry point for feature usage.
#     Called from FeatureSelect.tsx
#     """

#     # -----------------------------
#     # Validate user_id
#     # -----------------------------
#     try:
#         ObjectId(req.user_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid user_id")

#     # -----------------------------
#     # Build LangGraph payload
#     # -----------------------------
#     payload = {
#         "start_at": "user_selection",
#         "flag": "yes",
#         "selection": req.feature,   # 👈 internal mapping
#         "user_id": req.user_id,
#     }

#     # -----------------------------
#     # Invoke LangGraph
#     # -----------------------------
#     result = invoke(payload)

#     task = result.get("task")

#     # -----------------------------
#     # Success paths
#     # -----------------------------
#     if task in ("image_done", "report_done"):
#         return {
#             "flag": "yes",
#             "task": task,
#             "feature": req.feature,
#         }

#     # -----------------------------
#     # Failure
#     # -----------------------------
#     raise HTTPException(
#         status_code=400,
#         detail=result.get("message", "Failed to use feature"),
#     )


from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from bson import ObjectId

from app.services.graph_service import invoke

# ❗ IMPORTANT: NO prefix here
router = APIRouter()


# =========================
# Request schema
# =========================

class FeatureReq(BaseModel):
    user_id: str
    selection: Literal["image", "report"]


# =========================
# Use feature
# =========================

@router.post("/use")
def use_feature(req: FeatureReq):
    # Validate user_id
    try:
        ObjectId(req.user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")

    payload = {
        "start_at": "user_selection",
        "flag": "yes",
        "selection": req.selection,
        "user_id": req.user_id,
    }

    result = invoke(payload)

    task = result.get("task")

    if task in ("image_done", "report_done"):
        return {
            "flag": "yes",
            "task": task,
            "selection": req.selection,
        }

    raise HTTPException(
        status_code=400,
        detail=result.get("message", "Failed to use feature"),
    )
