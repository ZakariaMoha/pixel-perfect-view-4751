import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const checkTagline = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ canonical: z.string().min(3).max(300), copy: z.string().min(3).max(20000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { runTaglineCheck } = await import("./tagline-check.server");
    try {
      return { ok: true as const, ...(await runTaglineCheck(data.canonical, data.copy)) };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Check failed";
      const friendly = /402|credit/i.test(msg)
        ? "AI credits are used up. Add credits in your workspace to continue."
        : /429|rate/i.test(msg)
          ? "Too many requests right now. Please try again in a minute."
          : msg;
      return { ok: false as const, error: friendly };
    }
  });
