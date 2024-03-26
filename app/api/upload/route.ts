import fs from "fs";
import { NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const formDataEntryValues = Array.from(formData.values());

  let fileUrls = [];
  const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif|\.svg)$/i;
  for (const formDataEntryValue of formDataEntryValues) {
    if (
      typeof formDataEntryValue === "object" &&
      "arrayBuffer" in formDataEntryValue
    ) {
      const file = formDataEntryValue as unknown as Blob;
      const buffer = Buffer.from(await file.arrayBuffer());

      if (!allowedExtensions.exec(file.name)) {
        return NextResponse.json({
          success: false,
          message: "업로드할 수 있는 확장자: .jpg, .jpeg, .png, .gif, .svg",
        });
      }

      const randomFileName =
        crypto.randomBytes(15).toString("hex") + path.extname(file.name);
      const filePath = `public/upload/${randomFileName}`;

      fs.writeFileSync(filePath, buffer);
      // fileUrls.push(`http://localhost:3000/upload/${file.name}`);
      fileUrls.push(`/upload/${randomFileName}`);
    }
  }
  return NextResponse.json({ success: true, urls: fileUrls });
}
