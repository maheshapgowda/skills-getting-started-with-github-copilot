from fastapi.testclient import TestClient
import pytest

from src.app import app, activities

client = TestClient(app)


def test_get_activities_returns_200_and_structure():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    # expect at least one known activity
    assert "Chess Club" in data
    chess = data["Chess Club"]
    assert "participants" in chess


def test_signup_adds_participant():
    activity = "Chess Club"
    email = "pytest_user@example.com"

    # ensure clean state
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)

    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    assert resp.json()["message"].startswith("Signed up")
    assert email in activities[activity]["participants"]


def test_signup_duplicate_returns_400():
    activity = "Chess Club"
    email = "pytest_user@example.com"

    # ensure user is present
    if email not in activities[activity]["participants"]:
        activities[activity]["participants"].append(email)

    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 400


def test_unregister_removes_participant():
    activity = "Chess Club"
    email = "to_remove@example.com"

    # ensure user is present
    if email not in activities[activity]["participants"]:
        activities[activity]["participants"].append(email)

    resp = client.delete(f"/activities/{activity}/participants?email={email}")
    assert resp.status_code == 200
    assert email not in activities[activity]["participants"]


def test_unregister_nonexistent_returns_404():
    activity = "Chess Club"
    email = "not_in_list@example.com"

    # ensure user is not present
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)

    resp = client.delete(f"/activities/{activity}/participants?email={email}")
    assert resp.status_code == 404
