import { MessagesPage } from "@/components/chat/MessagesPage";

// Vendor Messages + Quotation Flow (Figma 300:11629 desktop / 300:26058 mobile).
// `?job=<jobId>` opens that job's conversation (linked from My Jobs / Job Details "View Chat").
export default async function Page({ searchParams }: { searchParams: Promise<{ job?: string | string[] }> }) {
  const { job } = await searchParams;
  return <MessagesPage role="vendor" initialJobId={Array.isArray(job) ? job[0] : job} />;
}
