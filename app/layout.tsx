import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Physics Pick | 1분 물리 설명";
const description = "2022 개정 교육과정 물리학 키워드를 뽑고 10분 조사한 뒤 1분 동안 설명하는 수업 활동 도구";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const image = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title,
    description,
    openGraph: { title, description, type: "website", locale: "ko_KR", images: [{ url: image, width: 1536, height: 1024, alt: "Physics Pick — 오늘의 물리, 딱 1분이면 돼." }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
