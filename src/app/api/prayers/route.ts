import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const payloadSchema = z.object({
  email: z.string().email("Email không hợp lệ."),
  wish: z
    .string()
    .min(5, "Hãy viết cụ thể hơn ít nhất 5 ký tự.")
    .max(1200, "Lời nguyện tối đa 1200 ký tự."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = payloadSchema.parse(body);

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!webhookUrl) {
      throw new Error("Missing N8N_WEBHOOK_URL env.");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (webhookSecret) {
      headers["x-webhook-secret"] = webhookSecret;
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!webhookResponse.ok) {
      const text = await webhookResponse.text();
      throw new Error(
        `n8n workflow error: ${webhookResponse.status} ${text.slice(0, 200)}`,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ.",
        },
        { status: 422 },
      );
    }

    console.error("Prayer submission failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể ghi nhận lời nguyện lúc này. Vui lòng thử lại trong giây lát.",
      },
      { status: 500 },
    );
  }
}
