import requests
import keyring
from config import REST_API_URL, SERVICE_NAME

def load_client_key():
    return keyring.get_password(SERVICE_NAME, "clientKey")

def save_client_key(client_key):
    keyring.set_password(SERVICE_NAME, "clientKey", client_key)

def is_client_key_valid(client_key):
    try:
        response = requests.get(f"{REST_API_URL}/user/client-key/{client_key}", timeout=5)
        if response.status_code == 200:
            print("Client key successfully verified.")
            return True
        return False
    except requests.RequestException:
        print("Error connecting to the server. Please check your internet connection.")
        return False

def get_client_key():
    client_key = load_client_key()

    if client_key and is_client_key_valid(client_key):
        return client_key

    while True:
        client_key = input("Enter your client key: ").strip()
        if is_client_key_valid(client_key):
            save_client_key(client_key)
            return client_key
        print("This client key is invalid. Please try again.")