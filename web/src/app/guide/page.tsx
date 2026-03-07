import { Shell } from "@/components/layout/Shell";
import GuideClient from "./guide-client";

export const metadata = {
  title: "دليل الاستخدام — القاموس العسكري الموحد",
  description: "دليل مفصل لاستخدام جميع ميزات القاموس العسكري الموحد",
};

export default function GuidePage() {
  return (
    <Shell title="دليل الاستخدام" backTo="/">
      <GuideClient />
    </Shell>
  );
}
