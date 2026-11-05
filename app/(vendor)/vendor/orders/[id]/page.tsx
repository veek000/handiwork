import { JobDetailsLoader } from "./JobDetailsLoader";

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobDetailsLoader id={id} />;
}
