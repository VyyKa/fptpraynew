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

    if (!process.env.N8N_WEBHOOK_URL) {
      console.warn("N8N webhook not configured. Skipping remote logging.");
    } else {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (process.env.N8N_WEBHOOK_SECRET) {
        headers["x-webhook-secret"] = process.env.N8N_WEBHOOK_SECRET;
      }
      try {
        const resp = await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          cache: "no-store",
        });
        if (!resp.ok) {
          console.error(
            `n8n webhook responded ${resp.status}. Ignoring and returning success.`,
          );
        }
      } catch (hookError) {
        console.error("n8n webhook call failed:", hookError);
      }
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
