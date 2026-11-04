import { MessagesPage } from "@/components/chat/MessagesPage";

// Customer Messages + Quotation Flow (Figma 291:46191 desktop / 290:11000 mobile).
// `?job=<jobId>` opens that job's conversation (linked from My Jobs / Job Details "View Chat").
export default async function Page({ searchParams }: { searchParams: Promise<{ job?: string | string[] }> }) {
  const { job } = await searchParams;
  return <MessagesPage role="customer" initialJobId={Array.isArray(job) ? job[0] : job} />;
}
