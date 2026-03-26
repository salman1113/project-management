def test_create_project(client, token_headers):
    response = client.post(
        "/api/projects/",
        json={"name": "Test Project", "description": "Desc"},
        headers=token_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"

def test_list_projects(client, token_headers):
    client.post("/api/projects/", json={"name": "Test Project", "description": "Desc"}, headers=token_headers)
    response = client.get("/api/projects/", headers=token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["items"][0]["name"] == "Test Project"

def test_delete_project(client, token_headers):
    res = client.post("/api/projects/", json={"name": "Test Project", "description": "Desc"}, headers=token_headers)
    project_id = res.json()["id"]
    
    del_res = client.delete(f"/api/projects/{project_id}", headers=token_headers)
    assert del_res.status_code == 200
    
    get_res = client.get(f"/api/projects/{project_id}", headers=token_headers)
    assert get_res.status_code == 404
