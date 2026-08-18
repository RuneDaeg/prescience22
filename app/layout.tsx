import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "PRE:SCIENCE | 통합과학2 선개념 진단";
const description = "2022 개정 교육과정 통합과학2 수업 전 학생의 선개념을 진단하고 학급 반응을 분석하는 교실 도구";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  return {
    metadataBase,
    title,
    description,
    openGraph: { title, description, type: "website", locale: "ko_KR", images: [{ url: "/og.png", width: 1740, height: 909, alt: "PRE:SCIENCE 통합과학2 선개념 진단" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
