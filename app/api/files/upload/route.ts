// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import CryptoJS from "crypto-js";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";


const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "fallback_encryption_key_12345";


const uploadDir = join(process.cwd(), "uploads");

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }


    const iv = CryptoJS.lib.WordArray.random(16);
    const ivString = iv.toString();


    const arrayBuffer = await file.arrayBuffer();
    const fileData = Buffer.from(arrayBuffer);
    const wordArray = CryptoJS.lib.WordArray.create(fileData);


    const encrypted = CryptoJS.AES.encrypt(wordArray, ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });


    const encryptedData = Buffer.from(ivString + encrypted.toString());


    const safeFileName = `${Date.now()}_${file.name.replace(/[^\w.-]/g, "_")}`;
    const filePath = join(uploadDir, safeFileName);

    
    await writeFile(filePath, encryptedData);

   
    const fileRecord = await db.file.create({
      data: {
        name: file.name,
        encryptedPath: safeFileName,
        type: file.type,
        size: file.size,
        iv: ivString,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      fileName: safeFileName,
      originalName: file.name,
      size: file.size,
      id: fileRecord.id,
    });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
