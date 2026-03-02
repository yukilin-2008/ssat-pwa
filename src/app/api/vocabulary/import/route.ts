import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServerClient } from '@/lib/supabase';

const vocabularySchema = z.object({
  word: z.string().min(1),
  partOfSpeech: z.string().min(1),
  gradeBand: z.enum(['A', 'B', 'C']),
  difficulty: z.number().int().min(1).max(3),
  definitionStudent: z.string().min(1),
  definitionAdvanced: z.string().min(1),
  synonyms: z.array(z.string().min(1)).length(3),
  antonyms: z.array(z.string().min(1)).min(1).max(2),
  exampleSentence: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  source: z.literal('original'),
});

type VocabularyPayload = z.infer<typeof vocabularySchema>;

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export async function POST(request: Request) {
  if (!supabaseServerClient) {
    return NextResponse.json(
      { error: 'Supabase is not configured on the server.' },
      { status: 500 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!Array.isArray(payload)) {
    return NextResponse.json({ error: 'Payload must be an array.' }, { status: 400 });
  }

  const validated: VocabularyPayload[] = [];
  const errors: { index: number; message: string }[] = [];

  payload.forEach((entry, index) => {
    const parsed = vocabularySchema.safeParse(entry);
    if (parsed.success) {
      validated.push(parsed.data);
    } else {
      errors.push({ index, message: parsed.error.message });
    }
  });

  if (validated.length === 0) {
    return NextResponse.json(
      { error: 'No valid entries found.', details: errors },
      { status: 400 }
    );
  }

  let insertedCount = 0;
  const chunks = chunk(validated, 500);

  for (const part of chunks) {
    const { error } = await supabaseServerClient
      .from('vocabulary')
      .insert(part.map((record) => ({
        word: record.word,
        part_of_speech: record.partOfSpeech,
        grade_band: record.gradeBand,
        difficulty: record.difficulty,
        definition_student: record.definitionStudent,
        definition_advanced: record.definitionAdvanced,
        synonyms: record.synonyms,
        antonyms: record.antonyms,
        example_sentence: record.exampleSentence,
        tags: record.tags,
        source: record.source,
      })));

    if (error) {
      return NextResponse.json(
        {
          error: 'Failed to insert into Supabase.',
          details: error.message,
          insertedCount,
          validationErrors: errors,
        },
        { status: 500 }
      );
    }

    insertedCount += part.length;
  }

  return NextResponse.json(
    {
      insertedCount,
      validationErrors: errors,
    },
    { status: 200 }
  );
}
