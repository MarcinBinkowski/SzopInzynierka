import boto3
from botocore.config import Config
from django.conf import settings
from urllib.parse import quote


def presign_download(key: str, expires: int = 600, as_attachment: bool = False) -> str:
    """Generate a pre-signed URL for downloading from MinIO using browser-accessible endpoint."""
    params = {"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": key}
    if as_attachment:
        filename = key.rsplit("/", 1)[-1]
        params["ResponseContentDisposition"] = (
            f'attachment; filename="{quote(filename)}"'
        )

    client = boto3.client(
        "s3",
        endpoint_url=settings.MINIO_PUBLIC_ENDPOINT,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
        use_ssl=settings.AWS_S3_USE_SSL,
        verify=settings.AWS_S3_VERIFY,
        config=Config(signature_version="s3v4"),
    )
    return client.generate_presigned_url("get_object", Params=params, ExpiresIn=expires)
