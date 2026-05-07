from __future__ import annotations

import colorsys
import json
from dataclasses import dataclass
from typing import Iterable
from urllib.parse import quote_plus, urlparse

from sqlalchemy.orm import Session, selectinload

from app.models.database import (
    ProductItem,
    ProjectAnalysisRun,
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

RETAILER_SEARCH_URLS = {
    "IKEA": "https://www.ikea.com/us/en/search/?q={query}",
    "Target": "https://www.target.com/s?searchTerm={query}",
    "Wayfair": "https://www.wayfair.com/keyword.php?keyword={query}",
    "Amazon": "https://www.amazon.com/s?k={query}",
}

ROOM_SHOPPING_BLUEPRINTS = {
    "living room": [
        {
            "key": "hero-seating",
            "label": "Main seating anchor",
            "category": "Furniture",
            "room_zone": "Conversation area",
            "item_term": "sofa",
            "retailers": ("IKEA", "Wayfair", "Target"),
        },
        {
            "key": "lighting-layer",
            "label": "Lighting layer",
            "category": "Lighting",
            "room_zone": "Ambient corners",
            "item_term": "floor lamp",
            "retailers": ("IKEA", "Target", "Amazon"),
        },
        {
            "key": "textile-layer",
            "label": "Texture layer",
            "category": "Textiles",
            "room_zone": "Floor plane",
            "item_term": "area rug",
            "retailers": ("Wayfair", "Target", "IKEA"),
        },
        {
            "key": "accent-finishing",
            "label": "Accent finish",
            "category": "Decor",
            "room_zone": "Shelves and tables",
            "item_term": "throw pillows decor",
            "retailers": ("Target", "Amazon", "IKEA"),
        },
    ],
    "bedroom": [
        {
            "key": "bed-anchor",
            "label": "Bed anchor",
            "category": "Furniture",
            "room_zone": "Sleeping zone",
            "item_term": "bed frame",
            "retailers": ("Wayfair", "IKEA", "Target"),
        },
        {
            "key": "bedside-lighting",
            "label": "Bedside lighting",
            "category": "Lighting",
            "room_zone": "Nightstands",
            "item_term": "bedside lamp",
            "retailers": ("Target", "IKEA", "Amazon"),
        },
        {
            "key": "bedding-layer",
            "label": "Bedding layer",
            "category": "Textiles",
            "room_zone": "Bed surface",
            "item_term": "duvet cover set",
            "retailers": ("Target", "Amazon", "Wayfair"),
        },
        {
            "key": "finish-storage",
            "label": "Storage accent",
            "category": "Storage",
            "room_zone": "Perimeter",
            "item_term": "nightstand dresser decor",
            "retailers": ("IKEA", "Wayfair", "Target"),
        },
    ],
    "home office": [
        {
            "key": "desk-anchor",
            "label": "Desk anchor",
            "category": "Furniture",
            "room_zone": "Work zone",
            "item_term": "desk",
            "retailers": ("IKEA", "Wayfair", "Target"),
        },
        {
            "key": "task-chair",
            "label": "Task chair",
            "category": "Furniture",
            "room_zone": "Primary seat",
            "item_term": "office chair",
            "retailers": ("Amazon", "Target", "Wayfair"),
        },
        {
            "key": "task-lighting",
            "label": "Task lighting",
            "category": "Lighting",
            "room_zone": "Desk surface",
            "item_term": "desk lamp",
            "retailers": ("Target", "Amazon", "IKEA"),
        },
        {
            "key": "focus-finish",
            "label": "Focus finish",
            "category": "Decor",
            "room_zone": "Shelving and wall",
            "item_term": "desk organizer wall shelf",
            "retailers": ("IKEA", "Amazon", "Target"),
        },
    ],
    "kitchen": [
        {
            "key": "seating-anchor",
            "label": "Seating anchor",
            "category": "Furniture",
            "room_zone": "Island or breakfast zone",
            "item_term": "counter stool",
            "retailers": ("Target", "Wayfair", "Amazon"),
        },
        {
            "key": "pendant-lighting",
            "label": "Pendant lighting",
            "category": "Lighting",
            "room_zone": "Prep zone",
            "item_term": "pendant light",
            "retailers": ("Wayfair", "Target", "Amazon"),
        },
        {
            "key": "runner-layer",
            "label": "Runner layer",
            "category": "Textiles",
            "room_zone": "Walk path",
            "item_term": "kitchen runner rug",
            "retailers": ("Target", "Amazon", "Wayfair"),
        },
        {
            "key": "counter-finish",
            "label": "Counter finish",
            "category": "Decor",
            "room_zone": "Countertop and shelf",
            "item_term": "kitchen canisters tray decor",
            "retailers": ("Target", "Amazon", "IKEA"),
        },
    ],
    "bathroom": [
        {
            "key": "mirror-anchor",
            "label": "Mirror or vanity anchor",
            "category": "Fixtures",
            "room_zone": "Vanity wall",
            "item_term": "bathroom mirror vanity",
            "retailers": ("Wayfair", "Target", "Amazon"),
        },
        {
            "key": "vanity-lighting",
            "label": "Vanity lighting",
            "category": "Lighting",
            "room_zone": "Vanity wall",
            "item_term": "bathroom vanity light",
            "retailers": ("Wayfair", "Amazon", "Target"),
        },
        {
            "key": "soft-goods",
            "label": "Soft goods",
            "category": "Textiles",
            "room_zone": "Floor and shower",
            "item_term": "bath mat shower curtain",
            "retailers": ("Target", "Amazon", "Wayfair"),
        },
        {
            "key": "storage-finish",
            "label": "Storage finish",
            "category": "Storage",
            "room_zone": "Toilet and vanity",
            "item_term": "bathroom storage organizer",
            "retailers": ("IKEA", "Target", "Amazon"),
        },
    ],
    "dining room": [
        {
            "key": "table-anchor",
            "label": "Dining anchor",
            "category": "Furniture",
            "room_zone": "Centerpiece",
            "item_term": "dining table chairs",
            "retailers": ("Wayfair", "IKEA", "Target"),
        },
        {
            "key": "pendant-anchor",
            "label": "Pendant anchor",
            "category": "Lighting",
            "room_zone": "Above table",
            "item_term": "dining pendant light",
            "retailers": ("Wayfair", "Target", "Amazon"),
        },
        {
            "key": "rug-layer",
            "label": "Rug layer",
            "category": "Textiles",
            "room_zone": "Under table",
            "item_term": "dining room rug",
            "retailers": ("Wayfair", "Target", "Amazon"),
        },
        {
            "key": "sideboard-finish",
            "label": "Storage finish",
            "category": "Storage",
            "room_zone": "Perimeter",
            "item_term": "sideboard buffet decor",
            "retailers": ("Wayfair", "IKEA", "Target"),
        },
    ],
}

DEFAULT_SHOPPING_BLUEPRINT = [
    {
        "key": "hero-piece",
        "label": "Hero piece",
        "category": "Furniture",
        "room_zone": "Primary zone",
        "item_term": "statement furniture",
        "retailers": ("Wayfair", "IKEA", "Target"),
    },
    {
        "key": "lighting-layer",
        "label": "Lighting layer",
        "category": "Lighting",
        "room_zone": "Ambient zone",
        "item_term": "accent lighting",
        "retailers": ("Target", "Amazon", "IKEA"),
    },
    {
        "key": "soft-layer",
        "label": "Soft layer",
        "category": "Textiles",
        "room_zone": "Comfort layer",
        "item_term": "rug textiles",
        "retailers": ("Target", "Wayfair", "Amazon"),
    },
    {
        "key": "finishing-layer",
        "label": "Finishing layer",
        "category": "Decor",
        "room_zone": "Accent zone",
        "item_term": "decor accessories",
        "retailers": ("Target", "Amazon", "IKEA"),
    },
]

BUDGET_LANGUAGE = {
    "low": "affordable",
    "medium": "mid-range",
    "high": "premium",
}

PRODUCT_MATCH_LABELS = ("Best Fit", "Best Value", "Alternate Pick")
MATCH_STOP_WORDS = {
    "the",
    "and",
    "for",
    "with",
    "room",
    "style",
    "plan",
    "layer",
    "anchor",
    "finish",
    "zone",
    "main",
}


@dataclass
class SuggestedTagRecord:
    tag: Tag
    confidence: float
    source: str


@dataclass
class RecommendationRefreshContext:
    suggested_tags: list[SuggestedTagRecord]
    intensity: int
    lighting: str
    budget_tier: str


def _normalize_key(value: str | None) -> str:
    return "".join(ch for ch in (value or "").strip().lower() if ch.isalnum())


def _normalize_tag_label(tag_name: str) -> str:
    return (tag_name or "").replace("-", " ").strip().lower()


def _decode_hex_color(dominant_hex: str | None) -> tuple[float, float, float] | None:
    raw = (dominant_hex or "").strip().lstrip("#")
    if len(raw) != 6:
        return None

    try:
        red = int(raw[0:2], 16) / 255.0
        green = int(raw[2:4], 16) / 255.0
        blue = int(raw[4:6], 16) / 255.0
    except ValueError:
        return None

    return red, green, blue


def _build_saved_tag_records(project: RoomProject) -> list[SuggestedTagRecord]:
    suggested_records = [
        SuggestedTagRecord(
            tag=room_tag.tag,
            confidence=0.82 if room_tag.is_confirmed else 0.64,
            source="saved-analysis",
        )
        for room_tag in project.room_tags
        if room_tag.tag is not None
    ]
    suggested_records.sort(key=lambda item: item.confidence, reverse=True)
    return suggested_records


def _decode_detected_tags(raw_value: str | None) -> list[str]:
    if not raw_value:
        return []

    try:
        parsed = json.loads(raw_value)
    except json.JSONDecodeError:
        return []

    if not isinstance(parsed, list):
        return []

    normalized = []
    for item in parsed:
        if not isinstance(item, str):
            continue
        cleaned = item.strip()
        if cleaned:
            normalized.append(cleaned)
    return normalized[:12]


def _build_image_profile_from_run(run: ProjectAnalysisRun | None) -> dict | None:
    if run is None:
        return None

    values = {
        "width": run.image_width,
        "height": run.image_height,
        "aspect_ratio": run.image_aspect_ratio,
        "average_brightness": run.image_average_brightness,
        "average_saturation": run.image_average_saturation,
        "warmth_bias": run.image_warmth_bias,
        "dominant_hex": run.image_dominant_hex,
    }
    if all(value is None for value in values.values()):
        return None

    return {
        "width": int(values["width"] or 0),
        "height": int(values["height"] or 0),
        "aspect_ratio": float(values["aspect_ratio"] or 1.0),
        "average_brightness": float(values["average_brightness"] or 0.0),
        "average_saturation": float(values["average_saturation"] or 0.0),
        "warmth_bias": float(values["warmth_bias"] or 0.0),
        "dominant_hex": values["dominant_hex"],
    }


def _build_saved_tag_records_from_run(
    db: Session,
    *,
    run: ProjectAnalysisRun | None,
) -> list[SuggestedTagRecord]:
    detected_tags = _decode_detected_tags(run.detected_tags_json if run is not None else None)
    if not detected_tags:
        return []

    available_tags = {tag.name.lower(): tag for tag in db.query(Tag).all()}
    fallback_records = []
    seen_tag_ids: set[int] = set()
    for tag_name in detected_tags:
        tag = available_tags.get(tag_name.lower())
        if tag is None or tag.id in seen_tag_ids:
            continue
        seen_tag_ids.add(tag.id)
        fallback_records.append(
            SuggestedTagRecord(tag=tag, confidence=0.63, source="saved-run")
        )
    return fallback_records


def _matched_tag_names_for_style(
    *,
    style: Style,
    suggested_records: list[SuggestedTagRecord],
    limit: int = 4,
) -> list[str]:
    style_tag_names = {
        style_tag.tag.name.lower(): style_tag.tag.name
        for style_tag in style.style_tags
        if style_tag.tag is not None
    }
    return [
        record.tag.name
        for record in suggested_records
        if record.tag.name.lower() in style_tag_names
    ][:limit]


def _build_style_scores_payload(
    *,
    scores: list[ResemblanceScore],
    suggested_records: list[SuggestedTagRecord],
) -> list[dict]:
    payload = []
    ranked_scores = sorted(scores, key=lambda item: item.score_value, reverse=True)
    for score in ranked_scores:
        style = score.style
        if style is None:
            continue
        payload.append(
            {
                "style_id": style.id,
                "style_name": style.name,
                "score_value": round(float(score.score_value or 0.0), 1),
                "matched_tags": _matched_tag_names_for_style(
                    style=style,
                    suggested_records=suggested_records,
                ),
            }
        )
    return payload


def build_saved_recommendation_context(
    db: Session,
    *,
    project: RoomProject,
) -> RecommendationRefreshContext:
    latest_run = (
        db.query(ProjectAnalysisRun)
        .filter(
            ProjectAnalysisRun.project_id == project.id,
            ProjectAnalysisRun.status == "succeeded",
        )
        .order_by(ProjectAnalysisRun.started_at.desc(), ProjectAnalysisRun.id.desc())
        .first()
    )
    if latest_run is None:
        latest_run = (
            db.query(ProjectAnalysisRun)
            .filter(ProjectAnalysisRun.project_id == project.id)
            .order_by(ProjectAnalysisRun.started_at.desc(), ProjectAnalysisRun.id.desc())
            .first()
        )

    suggested_tags = _build_saved_tag_records(project)
    if not suggested_tags:
        suggested_tags = _build_saved_tag_records_from_run(db, run=latest_run)

    return RecommendationRefreshContext(
        suggested_tags=suggested_tags,
        intensity=latest_run.intensity if latest_run is not None else 60,
        lighting=latest_run.lighting if latest_run is not None else "warm",
        budget_tier=(
            latest_run.budget_tier
            if latest_run is not None
            else _infer_budget_tier_from_value(project.budget)
        ),
    )


def _get_shopping_blueprint(room_type: str) -> list[dict]:
    room_key = (room_type or "").strip().lower()
    for candidate, blueprints in ROOM_SHOPPING_BLUEPRINTS.items():
        if candidate in room_key:
            return blueprints
    return DEFAULT_SHOPPING_BLUEPRINT


def _build_shopping_query(
    *,
    selected_style: Style,
    room_label: str,
    blueprint: dict,
    primary_tags: list[str],
    budget_tier: str,
) -> str:
    qualifiers = [selected_style.name.lower(), room_label.lower(), blueprint["item_term"]]
    qualifiers.extend(primary_tags[:2])
    qualifiers.append(BUDGET_LANGUAGE.get(budget_tier, "mid-range"))
    return " ".join(part for part in qualifiers if part).replace("  ", " ").strip()


def _build_shopping_sources(search_query: str, retailers: tuple[str, ...]) -> list[dict]:
    encoded = quote_plus(search_query)
    sources = []
    for retailer in retailers:
        template = RETAILER_SEARCH_URLS.get(retailer)
        if template is None:
            continue
        sources.append(
            {
                "retailer": retailer,
                "search_query": search_query,
                "url": template.format(query=encoded),
            }
        )
    return sources


def _retailer_from_url(url: str | None) -> str:
    if not url:
        return "Retailer"
    host = (urlparse(url).netloc or "").lower()
    if "amazon." in host:
        return "Amazon"
    if "target." in host:
        return "Target"
    if "ikea." in host:
        return "IKEA"
    if "wayfair." in host:
        return "Wayfair"
    return host.replace("www.", "").split(".")[0].title() if host else "Retailer"


def _format_price_label(estimated_cost: float) -> str:
    amount = max(0.0, float(estimated_cost or 0.0))
    floor = max(0, int(round(amount * 0.85 / 10.0) * 10))
    ceiling = max(floor + 20, int(round(amount * 1.15 / 10.0) * 10))
    return f"${floor}-${ceiling}"


def _tokenize_match_terms(*values: str) -> set[str]:
    tokens: set[str] = set()
    for value in values:
        for raw in (value or "").replace("-", " ").lower().split():
            token = "".join(ch for ch in raw if ch.isalnum())
            if len(token) < 3 or token in MATCH_STOP_WORDS:
                continue
            tokens.add(token)
    return tokens


def _build_search_product_matches(
    *,
    shopping_item: dict,
    selected_style: Style,
) -> list[dict]:
    matches = []
    for index, source in enumerate(shopping_item["sources"][:3]):
        adjusted_cost = round(float(shopping_item["estimated_cost"] or 0.0) * (0.92 + index * 0.08), 2)
        matches.append(
            {
                "key": f"{shopping_item['key']}-search-{index + 1}",
                "name": f"{selected_style.name} {shopping_item['label']}",
                "retailer": source["retailer"],
                "estimated_cost": adjusted_cost,
                "price_label": _format_price_label(adjusted_cost),
                "url": source["url"],
                "image_url": None,
                "match_reason": (
                    f"Search {source['retailer']} for a {shopping_item['category'].lower()} pick that supports the "
                    f"{shopping_item['room_zone'].lower()} and keeps the {selected_style.name.lower()} direction intact."
                ),
                "match_label": PRODUCT_MATCH_LABELS[min(index, len(PRODUCT_MATCH_LABELS) - 1)],
                "source_kind": "search",
            }
        )
    return matches


def _build_product_matches(
    *,
    shopping_item: dict,
    selected_style: Style,
) -> list[dict]:
    query_terms = _tokenize_match_terms(
        selected_style.name,
        shopping_item["label"],
        shopping_item["category"],
        shopping_item["room_zone"],
        shopping_item["search_query"],
    )
    target_cost = float(shopping_item["estimated_cost"] or 0.0)
    ranked_catalog_matches: list[tuple[float, ProductItem]] = []

    for product in selected_style.product_items or []:
        product_terms = _tokenize_match_terms(product.name)
        overlap = len(query_terms & product_terms)
        if overlap == 0 and query_terms:
            continue
        cost_delta = abs(float(product.estimated_cost or 0.0) - target_cost)
        closeness = 1 / (1 + (cost_delta / max(target_cost, 120.0)))
        ranked_catalog_matches.append((overlap * 2.0 + closeness, product))

    ranked_catalog_matches.sort(key=lambda item: item[0], reverse=True)
    matches: list[dict] = []
    for index, (_, product) in enumerate(ranked_catalog_matches[:3]):
        retailer = _retailer_from_url(product.url)
        matches.append(
            {
                "key": f"{shopping_item['key']}-catalog-{product.id}",
                "name": product.name,
                "retailer": retailer,
                "estimated_cost": round(float(product.estimated_cost or 0.0), 2),
                "price_label": _format_price_label(float(product.estimated_cost or 0.0)),
                "url": product.url or shopping_item["sources"][0]["url"],
                "image_url": product.image_url,
                "match_reason": (
                    f"Catalog match for the {shopping_item['category'].lower()} layer with a price point close to "
                    "this step's budget."
                ),
                "match_label": PRODUCT_MATCH_LABELS[min(index, len(PRODUCT_MATCH_LABELS) - 1)],
                "source_kind": "catalog",
            }
        )

    if len(matches) < 3:
        existing_retailers = {match["retailer"] for match in matches}
        for fallback in _build_search_product_matches(shopping_item=shopping_item, selected_style=selected_style):
            if fallback["retailer"] in existing_retailers:
                continue
            matches.append(fallback)
            existing_retailers.add(fallback["retailer"])
            if len(matches) == 3:
                break

    return matches


def _infer_budget_tier_from_value(budget_value: float | None) -> str:
    amount = float(budget_value or 0.0)
    if amount and amount <= 1500:
        return "low"
    if amount >= 4500:
        return "high"
    return "medium"


def build_project_shopping_plan(
    *,
    project: RoomProject,
    selected_style: Style,
    recommendations: list[Recommendation],
    suggested_tags: list[SuggestedTagRecord],
    budget_tier: str,
) -> list[dict]:
    """Translate saved recommendations into a shoppable first-pass buying plan."""
    budget_value = float(project.budget or DEFAULT_BUDGET_BY_TIER.get(budget_tier, 2600.0))
    room_label = (project.room_type or "Room").strip()
    primary_tags = [
        record.tag.name.replace("-", " ")
        for record in sorted(suggested_tags, key=lambda item: item.confidence, reverse=True)[:3]
    ]
    blueprints = _get_shopping_blueprint(room_label)

    shopping_plan = []
    for index, recommendation in enumerate(recommendations):
        blueprint = blueprints[min(index, len(blueprints) - 1)]
        search_query = _build_shopping_query(
            selected_style=selected_style,
            room_label=room_label,
            blueprint=blueprint,
            primary_tags=primary_tags,
            budget_tier=budget_tier,
        )
        estimated_cost = round(float(recommendation.estimated_cost or 0.0), 2)
        shopping_plan.append(
            {
                "key": f"{blueprint['key']}-{index + 1}",
                "label": blueprint["label"],
                "category": blueprint["category"],
                "room_zone": blueprint["room_zone"],
                "priority_label": f"Step {index + 1}",
                "purchase_reason": recommendation.description,
                "estimated_cost": estimated_cost,
                "budget_share": round(min(1.0, estimated_cost / budget_value), 2) if budget_value else 0.0,
                "is_completed": bool(recommendation.is_completed),
                "search_query": search_query,
                "sources": _build_shopping_sources(search_query, blueprint["retailers"]),
            }
        )
        shopping_plan[-1]["products"] = _build_product_matches(
            shopping_item=shopping_plan[-1],
            selected_style=selected_style,
        )

    return shopping_plan


def load_saved_project_analysis(
    db: Session,
    *,
    project: RoomProject,
) -> dict | None:
    """Rebuild the latest saved analysis payload from persisted project data."""
    saved_scores = (
        db.query(ResemblanceScore)
        .options(
            selectinload(ResemblanceScore.style).selectinload(Style.style_tags).selectinload(StyleTag.tag),
            selectinload(ResemblanceScore.style).selectinload(Style.product_items),
        )
        .filter(ResemblanceScore.room_project_id == project.id)
        .all()
    )
    if not saved_scores:
        return None

    saved_recommendations = (
        db.query(Recommendation)
        .filter(Recommendation.room_project_id == project.id)
        .order_by(Recommendation.priority_score.desc(), Recommendation.created_at.asc())
        .all()
    )
    latest_run = (
        db.query(ProjectAnalysisRun)
        .filter(
            ProjectAnalysisRun.project_id == project.id,
            ProjectAnalysisRun.status == "succeeded",
        )
        .order_by(ProjectAnalysisRun.started_at.desc(), ProjectAnalysisRun.id.desc())
        .first()
    )

    project = (
        db.query(RoomProject)
        .options(selectinload(RoomProject.room_tags).selectinload(RoomTag.tag))
        .filter(RoomProject.id == project.id)
        .first()
        or project
    )
    suggested_records = _build_saved_tag_records(project)
    if not suggested_records:
        suggested_records = _build_saved_tag_records_from_run(db, run=latest_run)

    ranked_scores = sorted(saved_scores, key=lambda item: item.score_value, reverse=True)
    selected_style = ranked_scores[0].style
    if selected_style is None:
        return None

    style_scores_payload = _build_style_scores_payload(
        scores=saved_scores,
        suggested_records=suggested_records,
    )

    suggested_tags_payload = [
        {
            "id": record.tag.id,
            "name": record.tag.name,
            "confidence": round(record.confidence, 2),
            "source": record.source,
        }
        for record in suggested_records
    ]

    summary = (
        f"{selected_style.name} scored {ranked_scores[0].score_value:.0f}% for this {project.room_type.lower()} "
        f"based on {len(suggested_tags_payload)} saved design signals."
    )

    return {
        "project": project,
        "selected_style": selected_style,
        "summary": summary,
        "image_profile": _build_image_profile_from_run(latest_run),
        "suggested_tags": suggested_tags_payload,
        "style_scores": style_scores_payload,
        "recommendations": saved_recommendations,
        "shopping_plan": build_project_shopping_plan(
            project=project,
            selected_style=selected_style,
            recommendations=saved_recommendations,
            suggested_tags=suggested_records,
            budget_tier=(
                latest_run.budget_tier
                if latest_run is not None
                else _infer_budget_tier_from_value(project.budget)
            ),
        ),
    }


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
        .options(
            selectinload(Style.style_tags).selectinload(StyleTag.tag),
            selectinload(Style.product_items),
        )
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
        .options(
            selectinload(Style.style_tags).selectinload(StyleTag.tag),
            selectinload(Style.product_items),
        )
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
        dominant_rgb = _decode_hex_color(image_profile.get("dominant_hex"))

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

        if dominant_rgb is not None:
            hue, lightness, dominant_saturation = colorsys.rgb_to_hls(*dominant_rgb)

            if dominant_saturation <= 0.15 and lightness >= 0.8:
                for tag_name in ("white", "neutral", "clean"):
                    register_tag(tag_name, "dominant-color", 0.69)
            elif dominant_saturation <= 0.16 and lightness <= 0.22:
                for tag_name in ("monochrome", "sleek", "metal"):
                    register_tag(tag_name, "dominant-color", 0.67)

            if 0.08 <= hue <= 0.15:
                for tag_name in ("walnut", "natural", "vintage"):
                    register_tag(tag_name, "dominant-color", 0.68)
            elif 0.18 <= hue <= 0.43:
                for tag_name in ("plants", "natural", "cozy"):
                    register_tag(tag_name, "dominant-color", 0.68)
            elif 0.52 <= hue <= 0.68:
                for tag_name in ("clean", "sleek", "monochrome"):
                    register_tag(tag_name, "dominant-color", 0.66)
            elif hue <= 0.05 or hue >= 0.94:
                for tag_name in ("rich-colors", "colorful", "eclectic"):
                    register_tag(tag_name, "dominant-color", 0.64)

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
        "shopping_plan": build_project_shopping_plan(
            project=project,
            selected_style=selected_style,
            recommendations=recommendations,
            suggested_tags=list(suggested_map.values()),
            budget_tier=budget_tier,
        ),
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
    primary_tags = [
        _normalize_tag_label(record.tag.name)
        for record in sorted(suggested_tags, key=lambda item: item.confidence, reverse=True)[:4]
    ]
    primary_a = primary_tags[0] if primary_tags else "clean lines"
    primary_b = primary_tags[1] if len(primary_tags) > 1 else selected_style.name.lower()

    style_weights = sorted(
        [
            (_normalize_tag_label(style_tag.tag.name), max(style_tag.weight, 0.35))
            for style_tag in selected_style.style_tags
            if style_tag.tag is not None
        ],
        key=lambda item: item[1],
        reverse=True,
    )
    matched_tag_names = {tag_name for tag_name in primary_tags}
    strongest_matched = [name for name, _ in style_weights if name in matched_tag_names][:2]
    strongest_missing = [name for name, _ in style_weights if name not in matched_tag_names][:2]

    anchor_blueprint = _get_shopping_blueprint(room_label)[0]
    matched_phrase = ", ".join(strongest_matched) if strongest_matched else primary_a
    missing_phrase = ", ".join(strongest_missing) if strongest_missing else selected_style.name.lower()

    scan_line = (
        f"Protect the strongest scan signals, especially {matched_phrase}, and repeat them across one major finish and one smaller accent so the room reads cohesive."
        if strongest_matched
        else f"Use repeated {matched_phrase} cues across two surfaces so the {room_label} feels more intentional and less pieced together."
    )
    gap_line = (
        f"Push the {selected_style.name.lower()} direction further by adding more {missing_phrase} through the {anchor_blueprint['label'].lower()} and nearby accent zones."
        if strongest_missing
        else f"Keep the larger purchases anchored to {selected_style.name.lower()} cues instead of mixing in unrelated styles."
    )

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

    budget_line = (
        f"Use the larger budget to upgrade one foundational {anchor_blueprint['category'].lower()} piece first, then add supporting accents that echo {selected_style.name.lower()} cues."
        if budget_tier == "high"
        else f"Keep the spending centered on the {anchor_blueprint['label'].lower()} and one supporting layer so the {room_label} improves without fragmenting the budget."
        if budget_tier == "medium"
        else f"Protect the budget by choosing an affordable {anchor_blueprint['label'].lower()} first and delaying secondary decor until the core direction feels right."
    )

    recommendation_specs = [
        (
            f"Anchor the {room_label} around {primary_a} and {primary_b} cues to strengthen the {selected_style.name.lower()} direction.",
            9.4,
            max(180.0, budget_value * 0.34),
        ),
        (
            gap_line,
            8.7,
            max(120.0, budget_value * 0.18),
        ),
        (
            lighting_line,
            8.1,
            max(140.0, budget_value * 0.22),
        ),
        (
            intensity_line,
            7.4,
            max(90.0, budget_value * 0.12),
        ),
        (
            f"{scan_line} {cross_style_line} {budget_line}",
            6.9,
            max(70.0, budget_value * 0.1),
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
