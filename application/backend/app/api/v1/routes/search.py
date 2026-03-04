from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.database import Style, Tag, StyleTag
from app.schemas.schemas import SearchResult, SearchResponse

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1, description="Search term"),
    limit: int = Query(20, ge=1, le=50),
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
):
    """Lightweight search over styles and tags with simple scoring.
    Score combines: name match (2x), description match (1x), tag hit (1.5x), length normalization.
    """
    term = f"%{q.lower()}%"

    styles = db.query(Style).filter(
        or_(
            Style.name.ilike(term),
            Style.description.ilike(term)
        )
    ).all()

    # tag hits: find styles whose tags match
    tag_hits = (
        db.query(Style)
        .join(StyleTag, StyleTag.style_id == Style.id)
        .join(Tag, Tag.id == StyleTag.tag_id)
        .filter(Tag.name.ilike(term))
        .all()
    )

    combined = {s.id: s for s in styles}
    for s in tag_hits:
        combined[s.id] = s

    results = []
    for s in combined.values():
        name_hit = 1 if q.lower() in (s.name or "").lower() else 0
        desc_hit = 1 if q.lower() in (s.description or "").lower() else 0
        tag_hit = 1 if any(q.lower() in t.name.lower() for t in s.style_tags and [st.tag for st in s.style_tags]) else 0
        score = 2 * name_hit + 1 * desc_hit + 1.5 * tag_hit
        score += min(len(q), 6) * 0.05  # slight boost for longer intent

        tags = [st.tag.name for st in s.style_tags] if s.style_tags else []
        results.append(
            SearchResult(
                id=s.id,
                type="style",
                title=s.name,
                snippet=(s.description or "")[:160],
                tags=tags,
                score=score,
                rank=0,
            )
        )

    results.sort(key=lambda r: r.score, reverse=True)

    total = len(results)
    start = (page - 1) * limit
    end = start + limit
    page_results = results[start:end]

    for idx, r in enumerate(page_results, start=start + 1):
        r.rank = idx

    return SearchResponse(
        results=page_results,
        total=total,
        page=page,
        limit=limit,
        has_more=end < total,
    )
