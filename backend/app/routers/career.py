from fastapi import APIRouter
router = APIRouter()

@router.get("/trajectory")
def get_trajectory():
    return {"status": "Phase 3 feature — coming soon"}
