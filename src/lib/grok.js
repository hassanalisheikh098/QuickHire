/**
 * Grok AI Service — xAI integration for semantic candidate search
 * Strictly aligned with the Supabase schema structure.
 */

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

function getApiKey() {
  const key = (import.meta.env.VITE_GROK_API_KEY || '').trim()
  if (!key ||
    key === 'your-grok-api-key-here' ||
    key.includes('***') ||
    key === 'gs***fk' ||
    key.length < 10) {
    console.warn('[Grok] API key not configured or contains an invalid mask. Using keyword fallback.')
    return null
  }
  return key
}

/**
 * Serializes Supabase candidates into a comprehensive payload for the AI prompt.
 * Maps the jsonb "experiences" structure directly.
 */
function buildCandidateContext(candidates) {
  return candidates.map((c) => {
    // Safely parse experiences since it comes out of Supabase as a structured array or jsonb string
    let parsedExperiences = []
    try {
      parsedExperiences = typeof c.experiences === 'string'
        ? JSON.parse(c.experiences)
        : (c.experiences || [])
    } catch (e) {
      console.warn(`Failed to parse experiences for candidate ${c.id}`, e)
    }

    return {
      id: c.id,
      name: c.name,
      title: c.title,
      skills: c.skills || [],
      location: c.location || 'Remote',
      ai_score: c.ai_score || 0,
      bio: c.bio || '',
      email: c.email || '',
      github: c.github || '',
      // Map the array fields extracted during onboarding
      experiences: parsedExperiences.map(exp => ({
        company: exp.company || '',
        role: exp.role || '',
        from: exp.from || '',
        to: exp.to || '',
        current: !!exp.current,
        description: exp.description || ''
      }))
    }
  })
}

const SYSTEM_PROMPT = `You are QuickHire's advanced executive talent matching engine.
Your objective is to thoroughly evaluate a recruiter's natural language search query against an indexed candidate database.

CRITICAL MATCHING METHODOLOGY:
1. Deep Context Evaluation: Do not just match flat skill arrays. Analyze the whole candidate trajectory.
2. Experience & Seniority: Evaluate explicit past companies, tenure lengths, roles, and descriptions within the nested "experiences" array.
3. Implied Backgrounds: Detect corporate domains or organizational sizes mentioned in historical summaries (e.g., startups, fintech, scale-ups).
4. Academic and Broad Profiles: Analyze the candidate bio, titles, and past background histories to capture implied education markers if specified by the recruiter.

You MUST return a valid JSON object matching this schema exactly:
{
  "results": [
    {
      "id": "<candidate id — must exactly match an id from the database>",
      "score": <number 0-100 indicating multi-vector match relevance>,
      "reason": "<One hyper-specific sentence proving alignment based on their historical experience, specific past role, or background text. Do not generalize.>"
    }
  ],
  "summary": "<A professional 2-3 sentence overview explaining why these specific selections match the search query.>",
  "query_interpretation": "<Brief statement outlining how you interpreted the recruiter's target seniority, skills, or operational background.>",
  "suggestions": ["<Query optimization suggestion 1>", "<Query optimization suggestion 2>"]
}

Strict Guardrails:
- Return at most 10 results, strictly ranked by semantic alignment score (highest match score first).
- Only include profiles that cleanly meet the core expectations (score >= 40).
- If no candidates align well with the target query criteria, return an empty results array [].`

/**
 * Search candidates using Grok AI or Groq AI based on key layout
 */
export async function searchCandidatesWithAI(query, candidates) {
  const apiKey = getApiKey()

  if (!apiKey) {
    return fallbackSearch(query, candidates)
  }

  if (!candidates || candidates.length === 0) {
    return { results: [], summary: 'No candidates in the database to search.', queryInterpretation: query, suggestions: [] }
  }

  let isGroq = false
  let finalKey = apiKey

  if (apiKey.startsWith('xai-gsk_')) {
    isGroq = true
    finalKey = apiKey.substring(4)
  } else if (apiKey.startsWith('gsk_')) {
    isGroq = true
  }

  const apiUrl = isGroq ? GROQ_API_URL : XAI_API_URL
  const modelName = isGroq ? 'llama-3.3-70b-versatile' : 'grok-2'

  const context = buildCandidateContext(candidates)
  const userMessage = `Here is the candidate database (${candidates.length} candidates):\n${JSON.stringify(context, null, 0)}\n\nRecruiter's search query: "${query}"`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${finalKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      console.error(`[AI Search] API error status: ${response.status}`)
      return fallbackSearch(query, candidates)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) return fallbackSearch(query, candidates)

    const cleanJson = content.replace(/^```json\s*/, '').replace(/```$/, '').trim()
    const parsed = JSON.parse(cleanJson)

    const rankedResults = (parsed.results || [])
      .map((r) => {
        const candidate = candidates.find((c) => String(c.id) === String(r.id))
        if (!candidate) return null
        return {
          ...candidate,
          ai_match_score: r.score,
          ai_reason: r.reason,
        }
      })
      .filter(Boolean)

    return {
      results: rankedResults,
      summary: parsed.summary || '',
      queryInterpretation: parsed.query_interpretation || '',
      suggestions: parsed.suggestions || [],
    }

  } catch (fetchErr) {
    console.error('[AI Search] Fatal processing exception:', fetchErr)
    return fallbackSearch(query, candidates)
  }
}

/**
 * Fallback search using database structural keyword checking
 */
export function fallbackSearch(query, candidates) {
  const queryLower = query.toLowerCase()
  const terms = queryLower.split(/\s+/).filter((t) => t.length > 2)

  if (terms.length === 0) {
    return {
      results: candidates.slice(0, 4).map(c => ({ ...c, ai_match_score: c.ai_score || 80, ai_reason: 'Top indexed candidate' })),
      summary: 'Please enter a more descriptive query.',
      queryInterpretation: query,
      suggestions: ['Search by explicit title', 'Search by past companies']
    }
  }

  const scored = candidates.map((c) => {
    let score = 0
    const reasons = []

    const experienceString = typeof c.experiences === 'string'
      ? c.experiences.toLowerCase()
      : JSON.stringify(c.experiences || '').toLowerCase()

    terms.forEach((term) => {
      if (c.title?.toLowerCase().includes(term)) { score += 35; reasons.push(`Title matches "${term}"`) }
      if (c.skills?.some((s) => s.toLowerCase().includes(term))) { score += 25; reasons.push(`Skills match "${term}"`) }
      if (experienceString.includes(term)) { score += 20; reasons.push(`Work history matches "${term}"`) }
      if (c.bio?.toLowerCase().includes(term)) { score += 10; reasons.push(`Bio references "${term}"`) }
      if (c.location?.toLowerCase().includes(term)) { score += 5 }
    })

    return {
      ...c,
      ai_match_score: Math.min(score, 100),
      ai_reason: reasons.slice(0, 2).join('; ') || 'Candidate match'
    }
  })

  const filtered = scored
    .filter((c) => c.ai_match_score > 0)
    .sort((a, b) => b.ai_match_score - a.ai_match_score)
    .slice(0, 10)

  return {
    results: filtered,
    summary: `Found ${filtered.length} matching profiles locally.`,
    queryInterpretation: query,
    suggestions: ['Verify VITE_GROK_API_KEY configurations for native AI vector calculations']
  }
}

export const isGrokConfigured = !!getApiKey()