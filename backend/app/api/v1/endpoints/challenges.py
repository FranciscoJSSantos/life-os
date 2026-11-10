from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.challenge import (
    ChallengeCreate, ChallengeRead, AISummaryRequest, ChallengeSummaryReport
)
from app.services.challenge_service import ChallengeService

router = APIRouter(prefix="/challenges", tags=["Desafios & Acurácia"])

@router.get("", response_model=list[ChallengeRead], summary="Listar Desafios com Acurácia")
def list_challenges(db: Session = Depends(get_db)):
    return ChallengeService.list_challenges_with_stats(db)

@router.post("", response_model=ChallengeRead, status_code=status.HTTP_201_CREATED, summary="Criar Novo Desafio")
def create_challenge(challenge_in: ChallengeCreate, db: Session = Depends(get_db)):
    created = ChallengeService.create_challenge(db, challenge_in)
    return ChallengeService.get_challenge_with_stats(db, created.id)

@router.get("/{challenge_id}", response_model=ChallengeRead, summary="Detalhes do Desafio com Estatísticas")
def get_challenge(challenge_id: str, db: Session = Depends(get_db)):
    stats = ChallengeService.get_challenge_with_stats(db, challenge_id)
    if not stats:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Desafio não encontrado")
    return stats

@router.post("/{challenge_id}/summary", response_model=ChallengeSummaryReport, summary="Gerar Resumo do Andamento (IA)")
def generate_summary(
    challenge_id: str, 
    payload: AISummaryRequest = AISummaryRequest(), 
    db: Session = Depends(get_db)
):
    try:
        return ChallengeService.get_summary_report(
            db, 
            challenge_id, 
            api_key=payload.api_key, 
            provider=payload.provider,
            custom_prompt=payload.custom_prompt
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
