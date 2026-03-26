def test_login_success(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={"email": test_user.email, "password": "testpass123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_failure(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={"email": test_user.email, "password": "wrongpassword"}
    )
    assert response.status_code == 401
