import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3Server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { Vector } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data";

const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPineCone(fileKey: string) {
  // download and read from pdf
  console.log("Downloading S3 into file system");
  const fileName = await downloadFromS3(fileKey);
  console.log(fileName);

  if (!fileName) {
    throw new Error("Could not download from S3. Something went wrong");
  }
  const loader = new PDFLoader(fileName as string);
  const pages = (await loader.load()) as PDFPage[];

  // Split and segment the pdf

  const documents = await Promise.all(
    pages.map((page) => prepareDocument(page))
  );

  // vectorize aand embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // storing vectors in pinecone
  const pineconeIndex = pineconeClient.Index("doctalk");

  pineconeIndex.upsert(vectors as PineconeRecord[]);

  return pages;
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as Vector;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const turncateStringByByte = (str: string, bytes: number) => {
  const encoder = new TextEncoder();
  return new TextDecoder("utf-8").decode(encoder.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  // eslint-disable-next-line prefer-const
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: turncateStringByByte(pageContent, 30000),
      },
    }),
  ]);
  return docs;
}
