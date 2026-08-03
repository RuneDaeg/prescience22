import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Topic Pick | 과학·사회·수학 10분 탐구, 1분 설명";
const description = "2022 개정 과학과·사회과·수학과 교육과정에서 개념 키워드를 뽑아 10분 조사한 뒤 1분 동안 설명하는 수업 활동 도구";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const image = new URL("/og-v2.png", metadataBase).toString();

  return {
    metadataBase,
    title,
    description,
    openGraph: { title, description, type: "website", locale: "ko_KR", images: [{ url: image, width: 1536, height: 1024, alt: "Topic Pick — 배운 개념을 설명해보세요. 10분 조사, 1분 설명." }] },
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
