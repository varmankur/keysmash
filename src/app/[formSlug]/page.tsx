import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import FormClient from './FormClient';

export default async function DynamicFormPage({ params }: { params: Promise<{ formSlug: string }> }) {
  const resolvedParams = await params;
  const form = await prisma.form.findUnique({
    where: { slug: resolvedParams.formSlug }
  });

  if (!form) {
    notFound();
  }

  let questions = [];
  try {
    questions = JSON.parse(form.questions);
  } catch {}

  return (
    <FormClient 
      formId={form.id}
      title={form.title}
      description={form.description}
      logoPath={form.logoPath}
      primaryColor={form.primaryColor}
      questions={questions}
    />
  );
}
