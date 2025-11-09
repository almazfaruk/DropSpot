import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine
from app import auth

def override_require_admin():
    class DummyAdmin:
        id = "admin"
        is_admin = True
    return DummyAdmin()

app.dependency_overrides[auth.require_admin] = override_require_admin


@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)


def test_full_crud_drops(client):

    create_resp = client.post(
        "/admin/drops",
        json={
            "title": "Integration Drop",
            "description": "Integration test description",
            "remaining_slots": 10
        }
    )
    assert create_resp.status_code == 200
    drop_id = create_resp.json()["id"]

    list_resp = client.get("/admin/droplist")
    assert list_resp.status_code == 200
    assert any(d["id"] == drop_id for d in list_resp.json())

    update_resp = client.put(
        f"/admin/drops/{drop_id}",
        json={
            "title": "Updated Drop",
            "description": "Updated Description",
            "remaining_slots": 15
        }
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Updated Drop"
    assert update_resp.json()["remaining_slots"] == 15

    delete_resp = client.delete(f"/admin/drops/{drop_id}")
    assert delete_resp.status_code == 200
    assert delete_resp.json()["status"] == "deleted"
