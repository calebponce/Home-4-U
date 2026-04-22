from uuid import uuid4

from fastapi.testclient import TestClient

from app.core.database import SessionLocal, init_db
from app.main import app
from app.models.database import RoomProject, Style, StyleTag, Tag, User
from app.utils.auth import create_access_token, get_password_hash

client = TestClient(app)


def ensure_style_with_tags(db, name: str, description: str, tag_names: list[str]) -> Style:
    style = db.query(Style).filter(Style.name == name).first()
    if style is None:
        style = Style(name=name, description=description)
        db.add(style)
        db.flush()

    existing_tag_ids = {style_tag.tag_id for style_tag in style.style_tags}
    for tag_name in tag_names:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if tag is None:
            tag = Tag(name=tag_name)
            db.add(tag)
            db.flush()
        if tag.id not in existing_tag_ids:
            db.add(StyleTag(style_id=style.id, tag_id=tag.id, weight=1.0))

    db.flush()
    db.refresh(style)
    return style


def test_workspace_analysis():
    init_db()
    db = SessionLocal()

    try:
        email = f"workspace-smoke-{uuid4().hex[:8]}@example.com"
        user = User(email=email, password_hash=get_password_hash("smoke-pass"))
        db.add(user)
        db.flush()

        style = ensure_style_with_tags(
            db,
            name="Scandinavian",
            description="Light, airy spaces with natural materials and cozy textures",
            tag_names=["cozy", "natural", "light-wood", "functional", "white"],
        )

        project = RoomProject(user_id=user.id, room_type="Living Room", budget=2600)
        db.add(project)
        db.commit()
        db.refresh(project)
        db.refresh(style)

        token = create_access_token({"sub": str(user.id)})
        response = client.post(
            f"/projects/{project.id}/analysis",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "style_id": style.id,
                "room_type": "Living Room",
                "intensity": 64,
                "lighting": "warm",
                "budget_tier": "medium",
                "image_profile": {
                    "width": 960,
                    "height": 720,
                    "aspect_ratio": 1.333,
                    "average_brightness": 0.68,
                    "average_saturation": 0.22,
                    "warmth_bias": 0.14,
                    "dominant_hex": "#d9d2c5",
                },
                "detected_tags": ["neutral", "clean"],
            },
        )

        assert response.status_code == 200, response.text
        payload = response.json()
        assert payload["selected_style"]["name"] == "Scandinavian"
        assert payload["project"]["id"] == project.id
        assert payload["style_scores"][0]["style_name"] == "Scandinavian"
        assert payload["style_scores"][0]["score_value"] >= 70
        assert len(payload["suggested_tags"]) >= 3
        assert len(payload["recommendations"]) >= 3
        assert len(payload["shopping_plan"]) >= 3
        assert payload["shopping_plan"][0]["sources"][0]["url"].startswith("https://")
        assert len(payload["shopping_plan"][0]["products"]) >= 1
        assert payload["shopping_plan"][0]["products"][0]["url"].startswith("https://")

        saved_response = client.get(
            f"/projects/{project.id}/analysis",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert saved_response.status_code == 200, saved_response.text
        saved_payload = saved_response.json()
        assert saved_payload["selected_style"]["name"] == "Scandinavian"
        assert saved_payload["shopping_plan"][0]["sources"][0]["url"].startswith("https://")
        assert len(saved_payload["shopping_plan"][0]["products"]) >= 1
    finally:
        db.close()


if __name__ == "__main__":
    test_workspace_analysis()
    print("workspace analysis smoke test passed")
