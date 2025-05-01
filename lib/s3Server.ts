import "server-only";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";

export async function downloadFromS3(fileKey: string) {
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

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
    };

    // Downloading file from S3
    const obj = await s3.getObject(params).promise();

    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const fileName = path.join(tempDir, `pdf-${Date.now()}.pdf`);
    fs.writeFileSync(fileName, obj.Body as Buffer);

    return fileName;
  } catch (error) {
    console.error(error);
  }
}
