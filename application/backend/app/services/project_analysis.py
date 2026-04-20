from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from sqlalchemy.orm import Session, selectinload

from app.models.database import (
    Recommendation,
    ResemblanceScore,
    RoomProject,
    RoomTag,
    Style,
    StyleTag,
    Tag,
)


DEFAULT_BUDGET_BY_TIER = {
    "low": 900.0,
    "medium": 2600.0,
    "high": 6500.0,
}

ROOM_TYPE_TAGS = {
    "living room": ("cozy", "coordinated", "plants"),
    "kitchen": ("functional", "clean", "simple"),
    "bedroom": ("cozy", "simple", "natural"),
    "bathroom": ("clean", "monochrome", "simple"),
    "office": ("functional", "geometric", "sleek"),
    "home office": ("functional", "geometric", "sleek"),
    "dining room": ("coordinated", "elegant", "rich-colors"),
}

LIGHTING_TAGS = {
    "warm": ("cozy", "natural", "vintage", "rich-colors"),
    "cool": ("sleek", "geometric", "monochrome", "metal", "clean"),
}

LOW_INTENSITY_TAGS = ("simple", "functional", "clean", "neutral")
HIGH_INTENSITY_TAGS = ("colorful", "patterns", "iconic", "ornate", "eclectic")


@dataclass
class SuggestedTagRecord:
    tag: Tag
    confidence: float
    source: str


def _normalize_key(value: str | None) -> str:
    return "".join(ch for ch in (value or "").strip().lower() if ch.isalnum())


def resolve_style_for_analysis(
    db: Session,
    *,
    style_id: int | None = None,
    style_slug: str | None = None,
    style_name: str | None = None,
) -> Style | None:
    """Resolve a style from id, slug, or name."""
    styles = (
        db.query(Style)
        .options(selectinload(Style.style_tags).selectinload(StyleTag.tag))
        .all()
    )

    normalized_slug = _normalize_key(style_slug)
    normalized_name = _normalize_key(style_name)

    for style in styles:
        if style_id is not None and style.id == style_id:
            return style

        normalized_style_name = _normalize_key(style.name)
        if normalized_slug and normalized_style_name == normalized_slug:
            return style
        if normalized_name and normalized_style_name == normalized_name:
            return style

    return None


def analyze_project_design(
    db: Session,
    *,
    project: RoomProject,
    selected_style: Style,
    room_type: str,
    intensity: int,
    lighting: str,
    budget_tier: str,
    image_profile: dict | None,
    detected_tags: Iterable[str],
) -> dict:
    """
    Persist room tags, resemblance scores, and recommendations for a project.

    The scoring intentionally stays deterministic and explainable so it aligns
    with the documented "structured, data-driven recommendation" scope.
    """
    available_tags = {tag.name.lower(): tag for tag in db.query(Tag).all()}
    all_styles = (
        db.query(Style)
        .options(selectinload(Style.style_tags).selectinload(StyleTag.tag))
        .all()
    )

    suggested_map: dict[int, SuggestedTagRecord] = {}

    def register_tag(tag_name: str, source: str, confidence: float) -> None:
        tag = available_tags.get(tag_name.lower())
        if tag is None:
            return
        confidence = max(0.35, min(0.98, confidence))
        current = suggested_map.get(tag.id)
        if current is None or confidence > current.confidence:
            suggested_map[tag.id] = SuggestedTagRecord(tag=tag, confidence=confidence, source=source)

    for style_tag in selected_style.style_tags:
        register_tag(style_tag.tag.name, "selected-style", 0.76 + min(style_tag.weight, 2.0) * 0.08)

    room_key = (room_type or project.room_type or "").strip().lower()
    for candidate, tag_names in ROOM_TYPE_TAGS.items():
        if candidate in room_key:
            for tag_name in tag_names:
                register_tag(tag_name, "room-type", 0.62)
            break

    for tag_name in LIGHTING_TAGS.get(lighting, ()):
        register_tag(tag_name, "lighting", 0.6)

    if intensity <= 35:
        for tag_name in LOW_INTENSITY_TAGS:
            register_tag(tag_name, "intensity", 0.58)
    elif intensity >= 70:
        for tag_name in HIGH_INTENSITY_TAGS:
            register_tag(tag_name, "intensity", 0.58)

    normalized_detected = [tag.strip().lower() for tag in detected_tags if tag.strip()]
    for tag_name in normalized_detected[:6]:
        register_tag(tag_name, "image-profile", 0.67)

    if image_profile:
        brightness = float(image_profile.get("average_brightness", 0.0) or 0.0)
        saturation = float(image_profile.get("average_saturation", 0.0) or 0.0)
        warmth = float(image_profile.get("warmth_bias", 0.0) or 0.0)

        if brightness >= 0.62:
            for tag_name in ("white", "neutral", "light-wood"):
                register_tag(tag_name, "image-profile", 0.64)
        elif brightness <= 0.35:
            for tag_name in ("rich-colors", "walnut", "metal"):
                register_tag(tag_name, "image-profile", 0.6)

        if saturation >= 0.56:
            for tag_name in ("colorful", "patterns", "eclectic"):
                register_tag(tag_name, "image-profile", 0.65)
        elif saturation <= 0.24:
            for tag_name in ("neutral", "monochrome", "clean"):
                register_tag(tag_name, "image-profile", 0.63)

        if warmth >= 0.1:
            for tag_name in ("cozy", "natural", "walnut"):
                register_tag(tag_name, "image-profile", 0.61)
        elif warmth <= -0.1:
            for tag_name in ("sleek", "metal", "contemporary"):
                register_tag(tag_name, "image-profile", 0.61)

    db.query(RoomTag).filter(RoomTag.room_project_id == project.id).delete(synchronize_session=False)
    db.query(ResemblanceScore).filter(ResemblanceScore.room_project_id == project.id).delete(synchronize_session=False)

    for record in suggested_map.values():
        db.add(
            RoomTag(
                room_project_id=project.id,
                tag_id=record.tag.id,
                is_confirmed=record.confidence >= 0.75,
            )
        )

    style_scores_payload = []
    for style in all_styles:
        style_weights = {
            style_tag.tag.name.lower(): max(style_tag.weight, 0.35)
            for style_tag in style.style_tags
            if style_tag.tag is not None
        }
        total_weight = sum(style_weights.values()) or 1.0
        weighted_match = 0.0
        matched_tags = []

        for tag_name, weight in style_weights.items():
            tag = available_tags.get(tag_name)
            if tag is None:
                continue
            record = suggested_map.get(tag.id)
            if record is None:
                continue
            weighted_match += record.confidence * weight
            matched_tags.append((tag.name, record.confidence * weight))

        coverage = weighted_match / total_weight
        score_value = coverage * 84.0

        if style.id == selected_style.id:
            score_value += 8.5 + intensity * 0.035

        if lighting == "warm" and any(name in style_weights for name in ("cozy", "natural", "vintage")):
            score_value += 2.5
        if lighting == "cool" and any(name in style_weights for name in ("sleek", "metal", "monochrome")):
            score_value += 2.5

        score_value = round(min(98.0, max(8.0, score_value)), 1)
        matched_tags.sort(key=lambda item: item[1], reverse=True)
        matched_names = [name for name, _ in matched_tags[:4]]

        score = ResemblanceScore(
            room_project_id=project.id,
            style_id=style.id,
            score_value=score_value,
        )
        db.add(score)
        style_scores_payload.append(
            {
                "style_id": style.id,
                "style_name": style.name,
                "score_value": score_value,
                "matched_tags": matched_names,
            }
        )

    db.flush()
    db.query(Recommendation).filter(Recommendation.room_project_id == project.id).delete(synchronize_session=False)

    recommendations = refresh_project_recommendations(
        db,
        project=project,
        selected_style=selected_style,
        style_scores=style_scores_payload,
        suggested_tags=list(suggested_map.values()),
        intensity=intensity,
        lighting=lighting,
        budget_tier=budget_tier,
    )

    suggested_tags_payload = [
        {
            "id": record.tag.id,
            "name": record.tag.name,
            "confidence": round(record.confidence, 2),
            "source": record.source,
        }
        for record in sorted(suggested_map.values(), key=lambda item: item.confidence, reverse=True)
    ]

    style_scores_payload.sort(key=lambda item: item["score_value"], reverse=True)
    best_score = next(
        (item for item in style_scores_payload if item["style_id"] == selected_style.id),
        style_scores_payload[0] if style_scores_payload else {"score_value": 0.0},
    )

    summary = (
        f"{selected_style.name} scored {best_score['score_value']:.0f}% for this {project.room_type.lower()} "
        f"based on {len(suggested_tags_payload)} saved design signals."
    )

    return {
        "project": project,
        "selected_style": selected_style,
        "summary": summary,
        "image_profile": image_profile,
        "suggested_tags": suggested_tags_payload,
        "style_scores": style_scores_payload,
        "recommendations": recommendations,
    }


def refresh_project_recommendations(
    db: Session,
    *,
    project: RoomProject,
    selected_style: Style,
    style_scores: list[dict],
    suggested_tags: list[SuggestedTagRecord],
    intensity: int,
    lighting: str,
    budget_tier: str,
) -> list[Recommendation]:
    """Create a fresh recommendation set from saved scores."""
    sorted_scores = sorted(style_scores, key=lambda item: item["score_value"], reverse=True)
    budget_value = float(project.budget or DEFAULT_BUDGET_BY_TIER.get(budget_tier, 2600.0))
    room_label = (project.room_type or "room").strip().lower()
    primary_tags = [record.tag.name for record in sorted(suggested_tags, key=lambda item: item.confidence, reverse=True)[:3]]
    primary_a = primary_tags[0] if primary_tags else "clean lines"
    primary_b = primary_tags[1] if len(primary_tags) > 1 else selected_style.name.lower()

    lighting_line = (
        "Layer warm ambient and task lighting so the room reads softer and more inviting at night."
        if lighting == "warm"
        else "Use cooler task lighting and sharper accents to keep the room crisp, bright, and focused."
    )
    intensity_line = (
        "Keep the envelope restrained and invest in one hero change before adding accessories."
        if intensity <= 35
        else "Push the style with one visible surface change and one statement furnishing so the room reads intentional."
        if intensity >= 70
        else "Balance structural upgrades with a few tactile accent pieces so the room evolves without feeling overdesigned."
    )

    secondary_score = next((item for item in sorted_scores if item["style_id"] != selected_style.id), None)
    cross_style_line = (
        f"Borrow a small amount of {secondary_score['style_name'].lower()} energy through accessories only; "
        "keep the larger investments anchored to the primary style."
        if secondary_score and secondary_score["score_value"] >= 52
        else "Keep supporting finishes quiet so the primary style reads consistently across the room."
    )

    recommendation_specs = [
        (
            f"Anchor the {room_label} around {primary_a} and {primary_b} cues to strengthen the {selected_style.name.lower()} direction.",
            9.4,
            max(180.0, budget_value * 0.34),
        ),
        (
            lighting_line,
            8.7,
            max(120.0, budget_value * 0.18),
        ),
        (
            intensity_line,
            8.1,
            max(140.0, budget_value * 0.22),
        ),
        (
            cross_style_line,
            7.4,
            max(90.0, budget_value * 0.12),
        ),
    ]

    created = []
    for description, priority_score, estimated_cost in recommendation_specs:
        recommendation = Recommendation(
            room_project_id=project.id,
            description=description,
            priority_score=round(priority_score, 1),
            estimated_cost=round(estimated_cost, 2),
        )
        db.add(recommendation)
        created.append(recommendation)

    db.flush()
    return created
