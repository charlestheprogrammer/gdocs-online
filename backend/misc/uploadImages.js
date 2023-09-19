const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({
  region: "eu-west-3",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function uploadImage(base64Image) {
  const randomUUID = uuidv4();
  const extension = base64Image.split(";")[0].split("/")[1];
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const params = {
    Bucket: "pae-bpifrance",
    Key: `nlpf/${randomUUID}.${extension}`,
    Body: Buffer.from(base64Data, "base64"),
    Metadata: {
      "Content-Type": `image/${extension}`,
      "Content-Length": `${Buffer.from(base64Data, "base64").length}`,
    },
  };
  s3.send(new PutObjectCommand(params));
  return `https://pae-bpifrance.s3.eu-west-3.amazonaws.com/nlpf/${randomUUID}.${extension}`;
}

module.exports = uploadImage;
