def test_create_task(client, token_headers):
    res = client.post("/api/projects/", json={"name": "P1"}, headers=token_headers)
    project_id = res.json()["id"]
    
    response = client.post(
        "/api/tasks/",
        json={
            "title": "T1",
            "description": "D1",
            "project_id": project_id
        },
        headers=token_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "T1"
    assert data["status"] == "todo"

def test_assign_task(client, token_headers, test_user):
    res = client.post("/api/projects/", json={"name": "P1"}, headers=token_headers)
    p_id = res.json()["id"]
    t_res = client.post(
        "/api/tasks/",
        json={"title": "T1", "project_id": p_id},
        headers=token_headers
    )
    t_id = t_res.json()["id"]

    assign_res = client.patch(
        f"/api/tasks/{t_id}/assign",
        json={"assigned_to": test_user.id},
        headers=token_headers
    )
    assert assign_res.status_code == 200
    assert assign_res.json()["assigned_to"] == test_user.id

def test_list_tasks(client, token_headers):
    res = client.post("/api/projects/", json={"name": "P1"}, headers=token_headers)
    p_id = res.json()["id"]
    client.post("/api/tasks/", json={"title": "T1", "project_id": p_id}, headers=token_headers)
    
    list_res = client.get(f"/api/tasks/?project_id={p_id}", headers=token_headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1
