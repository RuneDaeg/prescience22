import type { Metadata } from "next";
import "./vacation.css";

export const metadata: Metadata = {
  title: "방학 장례식 | 잘 가, 우리의 방학",
  description: "하얀 국화를 헌화하고 방학에게 마지막 조의문을 남기는 유쾌한 온라인 장례식",
  openGraph: {
    title: "방학 장례식 | 잘 가, 우리의 방학",
    description: "하얀 국화를 헌화하고 방학에게 마지막 조의문을 남기는 유쾌한 온라인 장례식",
    type: "website",
    locale: "ko_KR",
    images: [{ url: "/vacation-og.png", width: 1765, height: 901, alt: "방학 장례식 — 잘 가, 우리의 방학" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "방학 장례식 | 잘 가, 우리의 방학",
    description: "하얀 국화를 헌화하고 방학에게 마지막 조의문을 남기는 유쾌한 온라인 장례식",
    images: ["/vacation-og.png"],
  },
};

export default function VacationFuneralLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
