# from fastapi import APIRouter, HTTPException
# from datetime import datetime
# from bson import ObjectId
# from app.functions import users_db

# router = APIRouter(prefix="/report", tags=["Reports"])

# DUMMY_TESTS = [
#     {
#         "test_name": "Hemoglobin",
#         "value": 13.5,
#         "unit": "g/dL",
#         "normal_range": "13.0 - 17.0",
#     },
#     {
#         "test_name": "WBC",
#         "value": 7200,
#         "unit": "cells/uL",
#         "normal_range": "4000 - 11000",
#     },
# ]

# @router.post("/upload")
# def upload_report(user_id: str, report_name: str):
#     try:
#         ObjectId(user_id)
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid user_id")

#     report_id = users_db.reports.insert_one({
#         "user_id": user_id,
#         "report_name": report_name,
#         "uploaded_at": datetime.utcnow(),
#     }).inserted_id

#     for test in DUMMY_TESTS:
#         users_db.report_tests.insert_one({
#             "user_id": user_id,
#             "report_id": report_id,
#             "report_date": "2024-01-01",
#             **test,
#             "created_at": datetime.utcnow(),
#         })

#     return {"status": "success", "report_id": str(report_id)}

# @router.get("/tests/{user_id}")
# def get_test_names(user_id: str):
#     tests = users_db.report_tests.distinct("test_name", {"user_id": user_id})
#     return {"tests": tests}

# @router.get("/test/{user_id}/{test_name}")
# def get_test_history(user_id: str, test_name: str):
#     records = list(
#         users_db.report_tests.find(
#             {"user_id": user_id, "test_name": test_name},
#             {"_id": 0},
#         ).sort("report_date", 1)
#     )
#     return {"records": records}


from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

# TEMP in-memory store (later DB)
REPORT_STORE: Dict[str, Any] = {}

# @router.post("/upload")
# def upload_report(payload: Dict[str, Any]):
#     user_id = payload.get("user_id")
#     report_name = payload.get("report_name")

#     data = {
#         "status": "success",
#         "user_id": user_id,
#         "report_name": report_name,
#         "tests": {
#             "Hemoglobin": {
#                 "unit": "g/dL",
#                 "normal_range": [13, 17],
#                 "reports": [
#                     {"year": 2021, "value": 13.8},
#                     {"year": 2022, "value": 14.1},
#                     {"year": 2023, "value": 14.0},
#                     {"year": 2024, "value": 14.2}
#                 ]
#             },
#             "WBC": {
#                 "unit": "x10^9/L",
#                 "normal_range": [4, 11],
#                 "reports": [
#                     {"year": 2021, "value": 6.2},
#                     {"year": 2022, "value": 6.8},
#                     {"year": 2023, "value": 7.1},
#                     {"year": 2024, "value": 7.0}
#                 ]
#             }
#         }
#     }

#     REPORT_STORE[user_id] = data
#     return data

@router.post("/upload")
def upload_report(payload: Dict[str, Any]):
    user_id = payload.get("user_id")
    report_name = payload.get("report_name")

    data = {
        "status": "success",
        "user_id": user_id,
        "report_name": report_name,
        "tests": {
            "Hemoglobin": {
                "unit": "g/dL",
                "normal_range": [13, 17],
                "reports": [
                    {"year": 2021, "value": 13.8},
                    {"year": 2022, "value": 14.1},
                    {"year": 2023, "value": 14.0},
                    {"year": 2024, "value": 14.2},
                ]
            },
            "WBC": {
                "unit": "x10^9/L",
                "normal_range": [4, 11],
                "reports": [
                    {"year": 2021, "value": 6.2},
                    {"year": 2022, "value": 6.8},
                    {"year": 2023, "value": 7.1},
                    {"year": 2024, "value": 7.0},
                ]
            },
            "Platelets": {
                "unit": "x10^9/L",
                "normal_range": [150, 450],
                "reports": [
                    {"year": 2021, "value": 220},
                    {"year": 2022, "value": 210},
                    {"year": 2023, "value": 230},
                    {"year": 2024, "value": 240},
                ]
            },
            "Blood Glucose (Fasting)": {
                "unit": "mg/dL",
                "normal_range": [70, 99],
                "reports": [
                    {"year": 2021, "value": 92},
                    {"year": 2022, "value": 96},
                    {"year": 2023, "value": 101},
                    {"year": 2024, "value": 98},
                ]
            }
        }
    }

    REPORT_STORE[user_id] = data
    return data



@router.get("/summary/{user_id}")
def get_report_summary(user_id: str):
    if user_id not in REPORT_STORE:
        return {"tests": {}}

    return REPORT_STORE[user_id]
