import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Physics Pick | 물리학 10분 탐구, 1분 설명";
const description = "2022 개정 교육과정의 물리학 관련 과목에서 핵심 개념을 뽑아 10분 조사한 뒤 1분 동안 설명하는 수업 활동 도구";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title,
    description,
    openGraph: { title, description, type: "website", locale: "ko_KR" },
    twitter: { card: "summary", title, description },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
