// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { readFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import path from "path";
import CryptoJS from "crypto-js";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Get encryption key from environment variables
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "fallback_encryption_key_12345";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } },
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(null, { status: 401 });
    }

    // Get user from database using email
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return new NextResponse(null, { status: 404 });
    }

    const fileId = params.fileId;

    // Get file details from database
    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId: user.id, // Ensure file belongs to current user
      },
    });

    if (!file) {
      return new NextResponse(null, { status: 404 });
    }

    const filePath = join(process.cwd(), "uploads", file.encryptedPath);

    // Security check to prevent directory traversal
    if (!filePath.startsWith(join(process.cwd(), "uploads"))) {
      return new NextResponse(null, { status: 403 });
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse(null, { status: 404 });
    }

    // Read encrypted file
    const encryptedData = await readFile(filePath, "utf8");

    // Extract IV (first part before actual ciphertext)
    const ivLength = 32; // 16 bytes in hex = 32 characters
    const iv = CryptoJS.enc.Hex.parse(encryptedData.slice(0, ivLength));
    const ciphertext = encryptedData.slice(ivLength);

    // Decrypt data
    const decrypted = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Convert to buffer
    const decryptedArray = convertWordArrayToUint8Array(decrypted);

    // Return decrypted file with appropriate headers
    return new NextResponse(Buffer.from(decryptedArray), {
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse(null, { status: 500 });
  }
}

// DELETE handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } },
) {
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

    const fileId = params.fileId;

    // Get file details from database
    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId: user.id, // Ensure file belongs to current user
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filePath = join(process.cwd(), "uploads", file.encryptedPath);

    // Security check to prevent directory traversal
    if (!filePath.startsWith(join(process.cwd(), "uploads"))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if file exists
    if (existsSync(filePath)) {
      // Delete the file from disk
      await unlink(filePath);
    }

    // Delete the file record from database
    await db.file.delete({
      where: {
        id: fileId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `File deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}

// Helper function to convert CryptoJS WordArray to Uint8Array
function convertWordArrayToUint8Array(wordArray) {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const u8 = new Uint8Array(sigBytes);

  for (let i = 0; i < sigBytes; i++) {
    const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    u8[i] = byte;
  }

  return u8;
}
