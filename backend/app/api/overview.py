from fastapi import APIRouter, HTTPException
from app.functions import get_patient_overview_graph

router = APIRouter(tags=["Overview"]) 

@router.get("/{user_id}")
def patient_overview(user_id: str):
    try:
        return get_patient_overview_graph(user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
