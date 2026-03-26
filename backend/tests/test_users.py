def test_create_user(client):
    response = client.post(
        "/api/users/",
        json={
            "name": "New User",
            "email": "new@user.com",
            "password": "newpass123",
            "role": "developer"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@user.com"
    assert "id" in data

def test_list_users(client, token_headers):
    response = client.get("/api/users/", headers=token_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert len(data["items"]) >= 1

def test_get_my_profile(client, token_headers):
    response = client.get("/api/users/me", headers=token_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@user.com"
