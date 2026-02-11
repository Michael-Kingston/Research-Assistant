import requests
import os

def test_upload():
    url = "http://localhost:8001/upload"
    file_path = "requirements.txt"
    try:
        with open(file_path, "rb") as f:
            files = {"file": (file_path, f, "text/plain")}
            response = requests.post(url, files=files)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_upload()
