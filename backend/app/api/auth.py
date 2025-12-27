# # from fastapi import APIRouter, HTTPException
# # from pydantic import BaseModel
# # from typing import Optional
# # from bson import ObjectId

# # from app.services.graph_service import invoke
# # from app.functions import users_db

# # router = APIRouter()

# # # -------------------------
# # # REGISTER
# # # -------------------------

# # class RegisterReq(BaseModel):
# #     full_name: str
# #     email: str
# #     phone: str
# #     password: str
# #     plan_id: str

# #     gender: Optional[str] = None
# #     country: Optional[str] = None
# #     state: Optional[str] = None
# #     language: Optional[str] = None
# #     dob: Optional[str] = None
# #     user_type: Optional[str] = "patient"


# # @router.post("/register")
# # def register(req: RegisterReq):
# #     return invoke({
# #         "start_at": "sign_up",
# #         **req.dict()
# #     })


# # # -------------------------
# # # VERIFY OTP
# # # -------------------------

# # class VerifyReq(BaseModel):
# #     email: str
# #     otp_code: str


# # # @router.post("/verify")
# # # def verify(req: VerifyReq):
# # #     return invoke({
# # #         "start_at": "user_registration",
# # #         "flag": "yes",
# # #         **req.dict()
# # #     })

# # @router.post("/verify")
# # def verify(req: VerifyReq):
# #     result = invoke({
# #         "start_at": "user_registration",
# #         "flag": "yes",
# #         **req.dict()
# #     })

# #     # Ensure user_id is returned for frontend
# #     if result.get("flag") == "yes":
# #         user = users_db.users.find_one({"email": req.email})
# #         if user:
# #             result["user_id"] = str(user["_id"])

# #     return result



# # # -------------------------
# # # LOGIN
# # # -------------------------

# # class LoginReq(BaseModel):
# #     email_or_phone: str
# #     password: str


# # @router.post("/login")
# # def login(req: LoginReq):
# #     return invoke({
# #         "start_at": "sign_in",
# #         **req.dict()
# #     })


# # # -------------------------
# # # FORGOT PASSWORD
# # # -------------------------

# # class ForgotReq(BaseModel):
# #     email: str
# #     phone: str


# # @router.post("/forgot")
# # def forgot(req: ForgotReq):
# #     return invoke({
# #         "start_at": "forgot_password",
# #         **req.dict()
# #     })


# # # -------------------------
# # # RESET PASSWORD
# # # -------------------------

# # class ResetReq(BaseModel):
# #     email: str
# #     reset_token: str
# #     new_password: str


# # @router.post("/reset")
# # def reset(req: ResetReq):
# #     return invoke({
# #         "start_at": "reset_password",
# #         **req.dict()
# #     })


# # # -------------------------
# # # COMPLETE PROFILE (POST-OTP)
# # # -------------------------

# # class CompleteProfileReq(BaseModel):
# #     user_id: str

# #     plan_id: Optional[str] = None
# #     country: Optional[str] = None
# #     state: Optional[str] = None
# #     dob: Optional[str] = None
# #     language: Optional[str] = None
# #     gender: Optional[str] = None
# #     user_type: Optional[str] = "patient"


# # @router.post("/complete-profile")
# # def complete_profile(req: CompleteProfileReq):
# #     # Validate ObjectId
# #     try:
# #         user_object_id = ObjectId(req.user_id)
# #     except Exception:
# #         raise HTTPException(status_code=400, detail="Invalid user_id")

# #     update_data = {
# #         "plan_id": req.plan_id,
# #         "country": req.country,
# #         "state": req.state,
# #         "dob": req.dob,
# #         "language": req.language,
# #         "gender": req.gender,
# #         "user_type": req.user_type,
# #     }

# #     # Remove None values so we don’t overwrite existing fields
# #     update_data = {k: v for k, v in update_data.items() if v is not None}

# #     result = users_db.users.update_one(
# #         {"_id": user_object_id},
# #         {"$set": update_data}
# #     )

# #     if result.matched_count == 0:
# #         raise HTTPException(status_code=404, detail="User not found")

# #     return {"flag": "yes"}


# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from typing import Optional
# from bson import ObjectId

# from app.services.graph_service import invoke
# from app.functions import users_db

# router = APIRouter()

# # ======================================================
# # REGISTER
# # ======================================================

# class RegisterReq(BaseModel):
#     full_name: str
#     email: str
#     phone: str
#     password: str
#     plan_id: str

#     gender: Optional[str] = None
#     country: Optional[str] = None
#     state: Optional[str] = None
#     language: Optional[str] = None
#     dob: Optional[str] = None
#     user_type: Optional[str] = "patient"


# @router.post("/register")
# def register(req: RegisterReq):
#     return invoke({
#         "start_at": "sign_up",
#         **req.dict()
#     })


# # ======================================================
# # VERIFY OTP
# # ======================================================

# class VerifyReq(BaseModel):
#     email: str
#     otp_code: str


# @router.post("/verify")
# def verify(req: VerifyReq):
#     result = invoke({
#         "start_at": "user_registration",
#         "flag": "yes",
#         **req.dict()
#     })

#     # Ensure user_id is returned after verification
#     if result.get("flag") == "yes":
#         user = users_db.users.find_one({"email": req.email.lower()})
#         if user:
#             result["user_id"] = str(user["_id"])
#             result["user"] = {
#                 "id": str(user["_id"]),
#                 "email": user.get("email"),
#                 "name": user.get("name"),
#             }

#     return result


# # ======================================================
# # LOGIN (WITH STREAMLIT-STYLE FALLBACK)
# # ======================================================

# class LoginReq(BaseModel):
#     email_or_phone: str
#     password: str


# @router.post("/login")
# def login(req: LoginReq):
#     result = invoke({
#         "start_at": "sign_in",
#         **req.dict()
#     })

#     # If login failed, return immediately
#     if result.get("login_status") != "success":
#         return result

#     user_id = result.get("user_id")

#     # 🔥 FALLBACK — same logic as Streamlit
#     if not user_id:
#         identifier = req.email_or_phone.strip().lower()

#         query = (
#             {"email": identifier}
#             if "@" in identifier
#             else {"phone": req.email_or_phone.strip()}
#         )

#         user = users_db.users.find_one(query)

#         if not user:
#             raise HTTPException(
#                 status_code=401,
#                 detail="Login succeeded but user not found"
#             )

#         user_id = str(user["_id"])
#         result["user_id"] = user_id
#         result["user"] = {
#             "id": user_id,
#             "email": user.get("email"),
#             "name": user.get("name"),
#         }

#     return result


# # ======================================================
# # FORGOT PASSWORD
# # ======================================================

# class ForgotReq(BaseModel):
#     email: str
#     phone: str


# @router.post("/forgot")
# def forgot(req: ForgotReq):
#     return invoke({
#         "start_at": "forgot_password",
#         **req.dict()
#     })


# # ======================================================
# # RESET PASSWORD
# # ======================================================

# class ResetReq(BaseModel):
#     email: str
#     reset_token: str
#     new_password: str


# @router.post("/reset")
# def reset(req: ResetReq):
#     return invoke({
#         "start_at": "reset_password",
#         **req.dict()
#     })


# # ======================================================
# # COMPLETE PROFILE (POST-OTP)
# # ======================================================

# class CompleteProfileReq(BaseModel):
#     user_id: str

#     plan_id: Optional[str] = None
#     country: Optional[str] = None
#     state: Optional[str] = None
#     dob: Optional[str] = None
#     language: Optional[str] = None
#     gender: Optional[str] = None
#     user_type: Optional[str] = "patient"


# @router.post("/complete-profile")
# def complete_profile(req: CompleteProfileReq):
#     try:
#         user_object_id = ObjectId(req.user_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid user_id")

#     update_data = {
#         "plan_id": req.plan_id,
#         "country": req.country,
#         "state": req.state,
#         "dob": req.dob,
#         "language": req.language,
#         "gender": req.gender,
#         "user_type": req.user_type,
#     }

#     # Remove None values
#     update_data = {k: v for k, v in update_data.items() if v is not None}

#     result = users_db.users.update_one(
#         {"_id": user_object_id},
#         {"$set": update_data}
#     )

#     if result.matched_count == 0:
#         raise HTTPException(status_code=404, detail="User not found")

#     return {"flag": "yes"}


from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
from datetime import datetime, timezone

from app.services.graph_service import invoke
from app.functions import (
    users_db,
    compute_age_and_group,
    compute_bmi,
    validate_height_m,
    validate_weight_kg,
)

router = APIRouter()

# ======================================================
# REGISTER
# ======================================================

class RegisterReq(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str
    plan_id: str

    gender: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    language: Optional[str] = None
    dob: Optional[str] = None
    user_type: Optional[str] = "patient"


@router.post("/register")
def register(req: RegisterReq):
    return invoke({
        "start_at": "sign_up",
        **req.dict()
    })


# ======================================================
# VERIFY OTP
# ======================================================

class VerifyReq(BaseModel):
    email: str
    otp_code: str


@router.post("/verify")
def verify(req: VerifyReq):
    result = invoke({
        "start_at": "user_registration",
        "flag": "yes",
        **req.dict()
    })

    if result.get("flag") == "yes":
        user = users_db.users.find_one({"email": req.email.lower()})
        if user:
            result["user_id"] = str(user["_id"])
            result["user"] = {
                "id": str(user["_id"]),
                "email": user.get("email"),
                "name": user.get("name"),
            }

    return result


# ======================================================
# LOGIN
# ======================================================

class LoginReq(BaseModel):
    email_or_phone: str
    password: str


@router.post("/login")
def login(req: LoginReq):
    result = invoke({
        "start_at": "sign_in",
        **req.dict()
    })

    if result.get("login_status") != "success":
        return result

    if not result.get("user_id"):
        identifier = req.email_or_phone.strip().lower()
        query = {"email": identifier} if "@" in identifier else {"phone": req.email_or_phone.strip()}
        user = users_db.users.find_one(query)

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        result["user_id"] = str(user["_id"])
        result["user"] = {
            "id": str(user["_id"]),
            "email": user.get("email"),
            "name": user.get("name"),
        }

    return result


# ======================================================
# FORGOT PASSWORD
# ======================================================

class ForgotReq(BaseModel):
    email: str
    phone: str


@router.post("/forgot")
def forgot(req: ForgotReq):
    return invoke({
        "start_at": "forgot_password",
        **req.dict()
    })


# ======================================================
# RESET PASSWORD
# ======================================================

class ResetReq(BaseModel):
    email: str
    reset_token: str
    new_password: str


@router.post("/reset")
def reset(req: ResetReq):
    return invoke({
        "start_at": "reset_password",
        **req.dict()
    })


# ======================================================
# COMPLETE PROFILE (POST-OTP) 
# ======================================================

class CompleteProfileReq(BaseModel):
    user_id: str

    gender: Optional[str] = None
    dob: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    language: Optional[str] = None
    user_type: Optional[str] = "patient"

    blood_group: Optional[str] = None
    height: Optional[float] = None  # cm or meters
    weight: Optional[float] = None  # kg
    allergies: Optional[str] = None


@router.post("/complete-profile")
def complete_profile(req: CompleteProfileReq):
    try:
        user_object_id = ObjectId(req.user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user_id")

    if users_db is None:
        raise HTTPException(status_code=500, detail="DB not configured")

    # -------------------------------
    # Normalize height (cm → meters)
    # -------------------------------
    height_m = req.height
    if height_m is not None and height_m > 3:
        height_m = height_m / 100.0

    # -------------------------------
    # Validate height & weight
    # -------------------------------
    ok_h, msg_h = validate_height_m(height_m)
    ok_w, msg_w = validate_weight_kg(req.weight)

    if not ok_h:
        raise HTTPException(status_code=400, detail=msg_h)
    if not ok_w:
        raise HTTPException(status_code=400, detail=msg_w)

    # -------------------------------
    # Compute derived fields
    # -------------------------------
    age_val, age_group = compute_age_and_group(req.dob)
    bmi = compute_bmi(height_m, req.weight)

    # -------------------------------
    # Build update payload
    # -------------------------------
    update_data = {
        "gender": req.gender,
        "dob": req.dob,
        "age": age_val,            # ✅ FIX
        "age_group": age_group,    # ✅ FIX
        "country": req.country,
        "state": req.state,
        "language": req.language,
        "user_type": req.user_type,

        "blood_group": req.blood_group,
        "height_m": height_m,
        "weight_kg": req.weight,
        "bmi": bmi,
        "allergies": req.allergies,

        "profile_completed_at": datetime.now(timezone.utc),
    }

    # Remove None values (do not overwrite existing data)
    update_data = {k: v for k, v in update_data.items() if v is not None}

    result = users_db.users.update_one(
        {"_id": user_object_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "flag": "yes",
        "age": age_val,
        "age_group": age_group,
        "bmi": bmi,
    }
