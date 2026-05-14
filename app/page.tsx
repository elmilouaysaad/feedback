import { HomeClient } from '@/app/components/HomeClient';

export default function HomePage({
  searchParams,
}: {
  searchParams?: { tablet?: string | string[] };
}) {
  const tabletValue = searchParams?.tablet;
  const tabletCode = Array.isArray(tabletValue) ? tabletValue[0] : tabletValue || '';

  return <HomeClient tabletCode={tabletCode} />;
}