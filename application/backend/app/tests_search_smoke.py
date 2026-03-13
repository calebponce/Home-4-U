import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_search_modern():
    resp = client.get('/search?q=modern')
    assert resp.status_code == 200
    data = resp.json()
    print('results', json.dumps(data, indent=2)[:500])
    assert len(data) >= 1


if __name__ == '__main__':
    test_search_modern()
    print('ok')
