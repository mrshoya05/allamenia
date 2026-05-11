from fastapi import UploadFile
import aiofiles
import uuid
import os

async def save_file(file: UploadFile, folder: str):

    os.makedirs(f"media/{folder}", exist_ok=True)

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"

    file_path = f"media/{folder}/{filename}"

    async with aiofiles.open(file_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    return file_path