"""
storage_service.py
Handles upload and download of resume files to/from AWS S3.
Falls back to local filesystem in development mode.
"""
import os
import uuid
from pathlib import Path
from typing import BinaryIO

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings

LOCAL_UPLOAD_DIR = Path("/tmp/resumeai_uploads")
LOCAL_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

_s3_client = None


def _get_s3():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
    return _s3_client


def upload_resume(file_data: bytes, filename: str, user_id: str) -> str:
    """
    Upload resume file. Returns s3_key (or local path in dev mode).
    """
    ext = Path(filename).suffix.lower()
    key = f"resumes/{user_id}/{uuid.uuid4()}{ext}"

    if settings.ENVIRONMENT == "development" or not settings.AWS_ACCESS_KEY_ID:
        # Local filesystem fallback
        local_path = LOCAL_UPLOAD_DIR / key.replace("/", "_")
        local_path.write_bytes(file_data)
        return str(local_path)

    try:
        _get_s3().put_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=key,
            Body=file_data,
            ContentType=_content_type(ext),
        )
        return key
    except ClientError as e:
        raise RuntimeError(f"S3 upload failed: {e}")


def download_resume(s3_key: str) -> bytes:
    """Download resume file bytes from S3 or local path."""
    if s3_key.startswith("/tmp"):
        return Path(s3_key).read_bytes()

    try:
        obj = _get_s3().get_object(Bucket=settings.AWS_S3_BUCKET, Key=s3_key)
        return obj["Body"].read()
    except ClientError as e:
        raise RuntimeError(f"S3 download failed: {e}")


def get_presigned_url(s3_key: str, expires_in: int = 3600) -> str:
    """Generate a pre-signed URL for frontend direct download."""
    if s3_key.startswith("/tmp"):
        return f"/api/v1/resume/file/{s3_key.split('/')[-1]}"

    return _get_s3().generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.AWS_S3_BUCKET, "Key": s3_key},
        ExpiresIn=expires_in,
    )


def _content_type(ext: str) -> str:
    return {
        ".pdf":  "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".doc":  "application/msword",
    }.get(ext, "application/octet-stream")
