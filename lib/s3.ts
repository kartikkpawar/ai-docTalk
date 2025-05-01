import AWS from "aws-sdk";

export async function uploadToS3(file: File) {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
    });
    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      },
      region: process.env.NEXT_PUBLIC_S3_REGION,
    });

    const file_key =
      "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
      Body: file,
    };
    const upload = s3
      .putObject(params)
      .on("httpUploadProgress", (e) => {
        console.log(
          "uploadingToS3...",
          parseInt(((e.loaded * 100) / e.total).toString()) + "%"
        );
      })
      .promise();
    await upload.then(() => {
      console.log("successfully uploaded to S3", file_key);
    });

    return Promise.resolve({
      file_key,
      fileName: file.name,
    });
  } catch (error) {
    console.log("Upload to S3 went wrong", error);
  }
}

export function getS3Url(fileKey: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME!}.s3.${
    process.env.NEXT_PUBLIC_S3_REGION
  }.amazonaws.com/${fileKey}`;

  return url;
}
