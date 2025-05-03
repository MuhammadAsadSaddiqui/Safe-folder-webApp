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

// Get encryption key from environment variables
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "fallback_encryption_key_12345";

// Configure upload directory
const uploadDir = join(process.cwd(), "uploads");

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database using email
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Get form data with file
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate a random IV for encryption
    const iv = CryptoJS.lib.WordArray.random(16);
    const ivString = iv.toString();

    // Read file as array buffer and convert to WordArray
    const arrayBuffer = await file.arrayBuffer();
    const fileData = Buffer.from(arrayBuffer);
    const wordArray = CryptoJS.lib.WordArray.create(fileData);

    // Encrypt file data
    const encrypted = CryptoJS.AES.encrypt(wordArray, ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Store IV with encrypted data
    const encryptedData = Buffer.from(ivString + encrypted.toString());

    // Create a safe filename with timestamp to avoid duplicates
    const safeFileName = `${Date.now()}_${file.name.replace(/[^\w.-]/g, "_")}`;
    const filePath = join(uploadDir, safeFileName);

    // Write encrypted data to disk
    await writeFile(filePath, encryptedData);

    // Store file metadata in the database
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
