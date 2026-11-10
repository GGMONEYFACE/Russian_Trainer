import { caseKeys, isCaseKey, isLevel1Set, practiceTitle } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";

export type Role = "student" | "instructor";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type MissedQuestion = {
  questionKey: string;
  practiceId: string;
  prompt: string;
  detail: string;
  expected: string;
  lastGiven: string;
  misses: number;
  hits: number;
};

export type StudentAssignment = {
  id: string;
  title: string;
  practiceId: string;
  classroomName: string;
  completedAt: string | null;
  correct: number;
  total: number;
};

export type ClassroomSummary = {
  id: string;
  name: string;
  students: number;
  assignments: number;
};

export type AssignmentRoster = {
  id: string;
  title: string;
  practiceId: string;
  rows: {
    userId: string;
    name: string;
    email: string;
    completedAt: string | null;
    correct: number;
    total: number;
  }[];
};

export type ClassroomDetail = {
  id: string;
  name: string;
  members: PublicUser[];
  assignments: AssignmentRoster[];
};

export type AttemptInput = {
  questionKey: string;
  practiceId: string;
  prompt: string;
  detail: string;
  expected: string;
  given: string;
  correct: boolean;
};

export type ProgressResult = {
  ok: boolean;
  message: string;
};

export type AdminPerson = PublicUser & { createdAt: string };

export type AdminScore = {
  assignmentId: string;
  title: string;
  classroomName: string;
  userId: string;
  name: string;
  email: string;
  completedAt: string | null;
  correct: number;
  total: number;
};

export type AdminMiss = MissedQuestion & {
  userId: string;
  name: string;
  email: string;
};

export type SuggestionItem = {
  id: string;
  name: string;
  email: string;
  body: string;
  createdAt: string;
};

type AttemptRow = {
  user_id: string;
  question_key: string;
  practice_id: string;
  prompt: string;
  detail: string;
  expected: string;
  given: string;
  correct: boolean;
  created_at: string;
};

const knownErrors = [
  "Classroom not found.",
  "No account uses that email yet.",
  "That person is already in this classroom.",
  "That instructor code is not valid.",
  "Sign in again.",
  "That suggestion was already sent.",
  "Wait a bit before sending another suggestion.",
  "Too many suggestions just came in. Try again later.",
  "The suggestion list is full. Try again later.",
];

export function cleanName(value: string) {
  return value.trim().slice(0, 80);
}

export function cleanEmail(value: string) {
  return value.trim().toLowerCase().slice(0, 254);
}

export function emailLooksValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clip(value: string, max: number) {
  return value.trim().slice(0, max);
}

function knownError(error: { message: string } | null, fallback: string) {
  if (!error) return fallback;
  return knownErrors.find((item) => error.message.includes(item)) ?? fallback;
}

async function asUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || data?.claims.sub !== userId) return null;
  return supabase;
}

function practiceMatches(attemptPracticeId: string, assignmentPracticeId: string) {
  if (assignmentPracticeId === "level1") return attemptPracticeId.startsWith("level1:");
  if (assignmentPracticeId === "case-endings") return attemptPracticeId.startsWith("case-endings:");
  return attemptPracticeId === assignmentPracticeId;
}

function sanitizeAttempt(input: AttemptInput): AttemptInput | null {
  const practiceId = clip(input.practiceId, 80);
  const questionKey = clip(input.questionKey, 180);
  const setMatch = /^level1:([a-z0-9_]+)$/.exec(practiceId);
  const levelKey = /^level1:(.+):(agree|ending|gender)$/.exec(questionKey);
  const casePractice = /^case-endings:([a-z]+)$/.exec(practiceId);
  const caseQuestion = /^case:([a-z]+):(masculine|feminine|neuter):(adjective|noun)$/.exec(questionKey);
  const levelOk = Boolean(
    setMatch && levelKey && isLevel1Set(setMatch[1]) && levelKey[1].startsWith(`${setMatch[1]}-`),
  );
  const caseOk = Boolean(
    casePractice && caseQuestion && casePractice[1] === caseQuestion[1] && isCaseKey(casePractice[1]),
  );
  if (!levelOk && !caseOk) return null;
  return {
    questionKey,
    practiceId,
    prompt: clip(input.prompt, 400),
    detail: clip(input.detail, 80),
    expected: clip(input.expected, 200),
    given: clip(input.given, 80),
    correct: Boolean(input.correct),
  };
}

function groupMisses(rows: AttemptRow[]) {
  const grouped = new Map<string, MissedQuestion & { userId: string; lastWrongAt: string }>();
  for (const attempt of rows) {
    const current = grouped.get(attempt.question_key) ?? {
      userId: attempt.user_id,
      questionKey: attempt.question_key,
      practiceId: attempt.practice_id,
      prompt: attempt.prompt,
      detail: attempt.detail,
      expected: attempt.expected,
      lastGiven: attempt.given,
      misses: 0,
      hits: 0,
      lastWrongAt: "",
    };
    current.prompt = attempt.prompt;
    current.detail = attempt.detail;
    current.expected = attempt.expected;
    current.practiceId = attempt.practice_id;
    if (attempt.correct) current.hits += 1;
    else {
      current.misses += 1;
      if (attempt.created_at >= current.lastWrongAt) {
        current.lastWrongAt = attempt.created_at;
        current.lastGiven = attempt.given || "No answer";
      }
    }
    grouped.set(attempt.question_key, current);
  }
  return [...grouped.values()]
    .filter((item) => item.misses >= 2 && item.misses > item.hits)
    .sort((a, b) => b.misses - a.misses || b.lastWrongAt.localeCompare(a.lastWrongAt));
}

async function trimAttempts(userId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (!count || count <= 2500) return;
  const { data } = await supabase
    .from("attempts")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(count - 2500);
  const ids = (data ?? []).map((row) => row.id);
  if (ids.length) await supabase.from("attempts").delete().in("id", ids);
}

async function saveCompletion(
  assignmentId: string,
  userId: string,
  correct: number,
  total: number,
) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("completions")
    .select("completed_at")
    .eq("assignment_id", assignmentId)
    .eq("user_id", userId)
    .maybeSingle();
  const { error } = await supabase.from("completions").upsert(
    {
      assignment_id: assignmentId,
      user_id: userId,
      completed_at: existing?.completed_at ?? new Date().toISOString(),
      correct,
      total,
    },
    { onConflict: "assignment_id,user_id" },
  );
  if (error) throw new Error("Could not save the result.");
  return existing ? ("updated" as const) : ("created" as const);
}

export async function promoteToInstructor(code: string) {
  if (!process.env.INSTRUCTOR_CODE) return { ok: false as const, error: "Instructor signup is not turned on." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("promote_to_instructor", { code: code.trim() });
  if (error) return { ok: false as const, error: knownError(error, "That instructor code is not valid.") };
  return { ok: true as const };
}

export async function renameUser(userId: string, name: string) {
  const cleaned = cleanName(name);
  if (!cleaned) return { ok: false as const, error: "Enter your name." };
  const supabase = await asUser(userId);
  if (!supabase) return { ok: false as const, error: "Sign in again." };
  const { data, error } = await supabase.from("profiles").update({ name: cleaned }).eq("id", userId).select("id");
  if (error || !data?.length) return { ok: false as const, error: "Could not save your name." };
  return { ok: true as const };
}

export async function classroomsFor(instructorId: string): Promise<ClassroomSummary[]> {
  const supabase = await asUser(instructorId);
  if (!supabase) return [];
  const { data: classrooms } = await supabase
    .from("classrooms")
    .select("id, name, created_at")
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });
  const ids = (classrooms ?? []).map((classroom) => classroom.id);
  if (!ids.length) return [];
  const [{ data: members }, { data: assignments }] = await Promise.all([
    supabase.from("classroom_members").select("classroom_id").in("classroom_id", ids),
    supabase.from("assignments").select("classroom_id").in("classroom_id", ids),
  ]);
  return (classrooms ?? []).map((classroom) => ({
    id: classroom.id,
    name: classroom.name,
    students: (members ?? []).filter((member) => member.classroom_id === classroom.id).length,
    assignments: (assignments ?? []).filter((item) => item.classroom_id === classroom.id).length,
  }));
}

export async function createClassroom(instructorId: string, name: string) {
  const cleaned = cleanName(name);
  if (!cleaned) return { ok: false as const, error: "Enter a classroom name." };
  const supabase = await asUser(instructorId);
  if (!supabase) return { ok: false as const, error: "Sign in again." };
  const { data, error } = await supabase
    .from("classrooms")
    .insert({ instructor_id: instructorId, name: cleaned })
    .select("id")
    .single();
  if (error || !data) return { ok: false as const, error: "Could not create the classroom." };
  return { ok: true as const, id: data.id };
}

export async function classroomForInstructor(
  instructorId: string,
  classroomId: string,
): Promise<ClassroomDetail | null> {
  const supabase = await asUser(instructorId);
  if (!supabase) return null;
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name")
    .eq("id", classroomId)
    .eq("instructor_id", instructorId)
    .maybeSingle();
  if (!classroom) return null;
  const { data: memberships } = await supabase
    .from("classroom_members")
    .select("user_id, profiles(id, email, name, role)")
    .eq("classroom_id", classroom.id);
  const members = (memberships ?? []).flatMap((membership) => {
    const profile = Array.isArray(membership.profiles) ? membership.profiles[0] : membership.profiles;
    if (!profile) return [];
    return [
      {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role === "instructor" ? ("instructor" as const) : ("student" as const),
      },
    ];
  });
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, practice_id, created_at")
    .eq("classroom_id", classroom.id)
    .order("created_at", { ascending: false });
  const assignmentIds = (assignments ?? []).map((assignment) => assignment.id);
  const { data: completions } = assignmentIds.length
    ? await supabase
        .from("completions")
        .select("assignment_id, user_id, completed_at, correct, total")
        .in("assignment_id", assignmentIds)
    : { data: [] };
  return {
    id: classroom.id,
    name: classroom.name,
    members,
    assignments: (assignments ?? []).map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      practiceId: assignment.practice_id,
      rows: members.map((member) => {
        const completion = (completions ?? []).find(
          (item) => item.assignment_id === assignment.id && item.user_id === member.id,
        );
        return {
          userId: member.id,
          name: member.name,
          email: member.email,
          completedAt: completion?.completed_at ?? null,
          correct: completion?.correct ?? 0,
          total: completion?.total ?? 0,
        };
      }),
    })),
  };
}

export async function addClassroomMember(instructorId: string, classroomId: string, email: string) {
  const normalized = cleanEmail(email);
  if (!emailLooksValid(normalized)) return { ok: false as const, error: "Enter a valid email." };
  const supabase = await asUser(instructorId);
  if (!supabase) return { ok: false as const, error: "Sign in again." };
  const { data, error } = await supabase.rpc("add_class_member", {
    p_classroom: classroomId,
    p_email: normalized,
  });
  if (error) return { ok: false as const, error: knownError(error, "Could not add that person.") };
  return { ok: true as const, message: `Added ${data}.` };
}

export async function removeClassroomMember(instructorId: string, classroomId: string, userId: string) {
  const supabase = await asUser(instructorId);
  if (!supabase) return false;
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id")
    .eq("id", classroomId)
    .eq("instructor_id", instructorId)
    .maybeSingle();
  if (!classroom) return false;
  const { data: assignments } = await supabase.from("assignments").select("id").eq("classroom_id", classroom.id);
  const assignmentIds = (assignments ?? []).map((assignment) => assignment.id);
  if (assignmentIds.length) {
    await supabase.from("completions").delete().eq("user_id", userId).in("assignment_id", assignmentIds);
  }
  const { error } = await supabase
    .from("classroom_members")
    .delete()
    .eq("classroom_id", classroom.id)
    .eq("user_id", userId);
  return !error;
}

export async function assignPractice(instructorId: string, classroomId: string, practiceId: string) {
  const title = practiceTitle(practiceId);
  if (!title) return { ok: false as const, error: "Choose a practice." };
  const supabase = await asUser(instructorId);
  if (!supabase) return { ok: false as const, error: "Sign in again." };
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id")
    .eq("id", classroomId)
    .eq("instructor_id", instructorId)
    .maybeSingle();
  if (!classroom) return { ok: false as const, error: "Classroom not found." };
  const { error } = await supabase.from("assignments").insert({
    classroom_id: classroom.id,
    practice_id: practiceId,
    title,
  });
  if (error?.code === "23505") return { ok: false as const, error: "That practice is already assigned." };
  if (error) return { ok: false as const, error: "Could not assign that practice." };
  return { ok: true as const, message: `Assigned ${title}.` };
}

export async function studentAssignments(userId: string): Promise<StudentAssignment[]> {
  const supabase = await asUser(userId);
  if (!supabase) return [];
  const { data: memberships } = await supabase
    .from("classroom_members")
    .select("classroom_id")
    .eq("user_id", userId);
  const classroomIds = (memberships ?? []).map((membership) => membership.classroom_id);
  if (!classroomIds.length) return [];
  const [{ data: classrooms }, { data: assignments }] = await Promise.all([
    supabase.from("classrooms").select("id, name").in("id", classroomIds),
    supabase
      .from("assignments")
      .select("id, classroom_id, title, practice_id, created_at")
      .in("classroom_id", classroomIds)
      .order("created_at", { ascending: false }),
  ]);
  const assignmentIds = (assignments ?? []).map((assignment) => assignment.id);
  const { data: completions } = assignmentIds.length
    ? await supabase
        .from("completions")
        .select("assignment_id, completed_at, correct, total")
        .eq("user_id", userId)
        .in("assignment_id", assignmentIds)
    : { data: [] };
  return (assignments ?? []).map((assignment) => {
    const completion = (completions ?? []).find((item) => item.assignment_id === assignment.id);
    return {
      id: assignment.id,
      title: assignment.title,
      practiceId: assignment.practice_id,
      classroomName: (classrooms ?? []).find((classroom) => classroom.id === assignment.classroom_id)?.name ?? "Classroom",
      completedAt: completion?.completed_at ?? null,
      correct: completion?.correct ?? 0,
      total: completion?.total ?? 0,
    };
  });
}

export async function missedQuestions(userId: string): Promise<MissedQuestion[]> {
  const supabase = await asUser(userId);
  if (!supabase) return [];
  const { data } = await supabase
    .from("attempts")
    .select("user_id, question_key, practice_id, prompt, detail, expected, given, correct, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(2500);
  return groupMisses(data ?? []).slice(0, 50).map((item) => ({
    questionKey: item.questionKey,
    practiceId: item.practiceId,
    prompt: item.prompt,
    detail: item.detail,
    expected: item.expected,
    lastGiven: item.lastGiven,
    misses: item.misses,
    hits: item.hits,
  }));
}

export async function saveAttempt(userId: string, input: AttemptInput): Promise<ProgressResult> {
  const clean = sanitizeAttempt(input);
  if (!clean) return { ok: false, message: "" };
  const supabase = await asUser(userId);
  if (!supabase) return { ok: false, message: "" };
  const { error } = await supabase.from("attempts").insert({
    user_id: userId,
    question_key: clean.questionKey,
    practice_id: clean.practiceId,
    prompt: clean.prompt,
    detail: clean.detail,
    expected: clean.expected,
    given: clean.given,
    correct: clean.correct,
  });
  if (error) return { ok: false, message: "" };
  await trimAttempts(userId);
  return { ok: true, message: "" };
}

export async function finishLevelRound(userId: string, setId: string, total: number): Promise<ProgressResult> {
  if (setId !== "all" && !isLevel1Set(setId)) return { ok: false, message: "" };
  if (!Number.isInteger(total) || total < 1 || total > 24) return { ok: false, message: "" };
  const supabase = await asUser(userId);
  if (!supabase) return { ok: false, message: "" };
  const roundPractice = setId === "all" ? "level1" : `level1:${setId}`;
  const recentSince = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from("attempts")
    .select("practice_id, created_at")
    .eq("user_id", userId)
    .gte("created_at", recentSince)
    .limit(2500);
  const recentCount = (recent ?? []).filter((attempt) => practiceMatches(attempt.practice_id, roundPractice)).length;
  if (recentCount < total) return { ok: true, message: "Saved to your profile." };

  const assignments = await studentAssignments(userId);
  let created = 0;
  let updated = 0;
  let pending = 0;
  for (const assignment of assignments) {
    const matches = setId === "all" ? assignment.practiceId === "level1" : assignment.practiceId === `level1:${setId}`;
    if (!matches) continue;
    const { data: assignmentRow } = await supabase
      .from("assignments")
      .select("created_at")
      .eq("id", assignment.id)
      .maybeSingle();
    const since = assignmentRow?.created_at ?? new Date().toISOString();
    const { data: rows } = await supabase
      .from("attempts")
      .select("correct, created_at, practice_id")
      .eq("user_id", userId)
      .gte("created_at", since)
      .limit(2500);
    const matching = (rows ?? []).filter((attempt) => practiceMatches(attempt.practice_id, assignment.practiceId));
    if (matching.length < total) {
      pending += 1;
      continue;
    }
    const correct = matching.filter((attempt) => attempt.correct).length;
    const status = await saveCompletion(assignment.id, userId, correct, matching.length);
    if (status === "created") created += 1;
    else updated += 1;
  }
  if (created) return { ok: true, message: "Marked done for your instructor." };
  if (pending) return { ok: true, message: "Saved. Finish a full round after it was assigned and it will show as done." };
  if (updated) return { ok: true, message: "Updated the score your instructor can see." };
  return { ok: true, message: "Saved to your profile." };
}

export async function saveCaseRound(
  userId: string,
  caseKey: string,
  cells: AttemptInput[],
): Promise<ProgressResult> {
  if (!isCaseKey(caseKey) || cells.length !== 6) return { ok: false, message: "" };
  const cleanCells = cells.map((cell) => sanitizeAttempt(cell));
  if (cleanCells.some((cell) => !cell || !cell.questionKey.startsWith(`case:${caseKey}:`))) {
    return { ok: false, message: "" };
  }
  const ready = cleanCells as AttemptInput[];
  const supabase = await asUser(userId);
  if (!supabase) return { ok: false, message: "" };
  const createdAt = new Date().toISOString();
  const { error } = await supabase.from("attempts").insert(
    ready.map((cell) => ({
      user_id: userId,
      question_key: cell.questionKey,
      practice_id: `case-endings:${caseKey}`,
      prompt: cell.prompt,
      detail: cell.detail,
      expected: cell.expected,
      given: cell.given,
      correct: cell.correct,
      created_at: createdAt,
    })),
  );
  if (error) return { ok: false, message: "" };
  const score = ready.filter((cell) => cell.correct).length;
  await supabase.from("case_checks").insert({
    user_id: userId,
    case_key: caseKey,
    score,
    total: ready.length,
    created_at: createdAt,
  });
  await trimAttempts(userId);

  const assignments = await studentAssignments(userId);
  let created = 0;
  let updated = 0;
  let waiting = 0;
  for (const assignment of assignments) {
    if (assignment.practiceId === `case-endings:${caseKey}`) {
      const status = await saveCompletion(assignment.id, userId, score, ready.length);
      if (status === "created") created += 1;
      else updated += 1;
      continue;
    }
    if (assignment.practiceId !== "case-endings") continue;
    const { data: assignmentRow } = await supabase
      .from("assignments")
      .select("created_at")
      .eq("id", assignment.id)
      .maybeSingle();
    const since = assignmentRow?.created_at ?? createdAt;
    const { data: checks } = await supabase
      .from("case_checks")
      .select("case_key, score, total, created_at")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: true })
    .limit(2500);
    const latest = new Map<string, { score: number; total: number }>();
    for (const check of checks ?? []) latest.set(check.case_key, { score: check.score, total: check.total });
    const keys = caseKeys();
    if (keys.some((key) => !latest.has(key))) {
      waiting += 1;
      continue;
    }
    const scoreSum = keys.reduce((sum, key) => sum + (latest.get(key)?.score ?? 0), 0);
    const totalSum = keys.reduce((sum, key) => sum + (latest.get(key)?.total ?? 0), 0);
    const status = await saveCompletion(assignment.id, userId, scoreSum, totalSum);
    if (status === "created") created += 1;
    else updated += 1;
  }
  if (created && waiting) {
    return { ok: true, message: "Marked done. Check the other cases to finish the full case-endings assignment." };
  }
  if (waiting) return { ok: true, message: "Saved. Check the other cases to finish the assignment." };
  if (created) return { ok: true, message: "Marked done for your instructor." };
  if (updated) return { ok: true, message: "Updated the score your instructor can see." };
  return { ok: true, message: "Saved to your profile." };
}

export async function adminPeople(): Promise<AdminPerson[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, email, name, role, created_at").order("name");
  return (data ?? []).map((person) => ({
    id: person.id,
    email: person.email,
    name: person.name,
    role: person.role === "instructor" ? "instructor" : "student",
    createdAt: person.created_at,
  }));
}

export async function adminScores(): Promise<AdminScore[]> {
  const supabase = await createClient();
  const [{ data: assignments }, { data: members }, { data: completions }] = await Promise.all([
    supabase.from("assignments").select("id, title, classroom_id, classrooms(name)"),
    supabase.from("classroom_members").select("classroom_id, user_id, profiles(id, name, email)"),
    supabase.from("completions").select("assignment_id, user_id, completed_at, correct, total"),
  ]);
  const rows: AdminScore[] = [];
  for (const assignment of assignments ?? []) {
    const classroom = Array.isArray(assignment.classrooms) ? assignment.classrooms[0] : assignment.classrooms;
    for (const member of (members ?? []).filter((item) => item.classroom_id === assignment.classroom_id)) {
      const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
      if (!profile) continue;
      const completion = (completions ?? []).find(
        (item) => item.assignment_id === assignment.id && item.user_id === profile.id,
      );
      rows.push({
        assignmentId: assignment.id,
        title: assignment.title,
        classroomName: classroom?.name ?? "Classroom",
        userId: profile.id,
        name: profile.name,
        email: profile.email,
        completedAt: completion?.completed_at ?? null,
        correct: completion?.correct ?? 0,
        total: completion?.total ?? 0,
      });
    }
  }
  return rows.sort(
    (a, b) => a.classroomName.localeCompare(b.classroomName) || a.title.localeCompare(b.title) || a.name.localeCompare(b.name),
  );
}

export async function adminMisses(): Promise<AdminMiss[]> {
  const supabase = await createClient();
  const [{ data: attempts }, { data: profiles }] = await Promise.all([
    supabase
      .from("attempts")
      .select("user_id, question_key, practice_id, prompt, detail, expected, given, correct, created_at")
      .order("created_at", { ascending: true })
      .limit(2500),
    supabase.from("profiles").select("id, name, email"),
  ]);
  const people = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const grouped = new Map<string, AdminMiss & { lastWrongAt: string }>();
  for (const attempt of attempts ?? []) {
    const person = people.get(attempt.user_id);
    if (!person) continue;
    const key = `${attempt.user_id}:${attempt.question_key}`;
    const current = grouped.get(key) ?? {
      userId: person.id,
      name: person.name,
      email: person.email,
      questionKey: attempt.question_key,
      practiceId: attempt.practice_id,
      prompt: attempt.prompt,
      detail: attempt.detail,
      expected: attempt.expected,
      lastGiven: attempt.given,
      misses: 0,
      hits: 0,
      lastWrongAt: "",
    };
    current.name = person.name;
    current.email = person.email;
    current.prompt = attempt.prompt;
    current.detail = attempt.detail;
    current.expected = attempt.expected;
    current.practiceId = attempt.practice_id;
    if (attempt.correct) current.hits += 1;
    else {
      current.misses += 1;
      if (attempt.created_at >= current.lastWrongAt) {
        current.lastWrongAt = attempt.created_at;
        current.lastGiven = attempt.given || "No answer";
      }
    }
    grouped.set(key, current);
  }
  return [...grouped.values()]
    .filter((item) => item.misses >= 2 && item.misses > item.hits)
    .sort((a, b) => b.misses - a.misses || a.name.localeCompare(b.name))
    .slice(0, 80)
    .map((item) => ({
      userId: item.userId,
      name: item.name,
      email: item.email,
      questionKey: item.questionKey,
      practiceId: item.practiceId,
      prompt: item.prompt,
      detail: item.detail,
      expected: item.expected,
      lastGiven: item.lastGiven,
      misses: item.misses,
      hits: item.hits,
    }));
}

export async function adminRename(userId: string, name: string) {
  const cleaned = cleanName(name);
  if (!cleaned) return { ok: false as const, error: "Enter a name." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").update({ name: cleaned }).eq("id", userId).select("id");
  if (error || !data?.length) return { ok: false as const, error: "Account not found." };
  return { ok: true as const };
}

export async function adminSetRole(userId: string, role: Role) {
  if (role !== "student" && role !== "instructor") {
    return { ok: false as const, error: "Choose student or instructor." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").update({ role }).eq("id", userId).select("id");
  if (error || !data?.length) return { ok: false as const, error: "Account not found." };
  return { ok: true as const };
}

export async function adminSetScore(
  assignmentId: string,
  userId: string,
  correct: number,
  total: number,
  done: boolean,
) {
  const supabase = await createClient();
  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, classroom_id")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!assignment) return { ok: false as const, error: "Assignment not found." };
  const { data: member } = await supabase
    .from("classroom_members")
    .select("user_id")
    .eq("classroom_id", assignment.classroom_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!member) return { ok: false as const, error: "That person is not in this class." };
  if (!done) {
    const { error } = await supabase.from("completions").delete().eq("assignment_id", assignmentId).eq("user_id", userId);
    if (error) return { ok: false as const, error: "Could not update the result." };
    return { ok: true as const, message: "Marked not done." };
  }
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total < 1 || total > 500 || correct < 0 || correct > total) {
    return { ok: false as const, error: "Enter a score from 0 to the total, up to 500." };
  }
  await saveCompletion(assignmentId, userId, correct, total);
  return { ok: true as const, message: "Result saved." };
}

export async function adminClearQuestion(userId: string, questionKey: string) {
  const key = questionKey.trim().slice(0, 180);
  if (!key) return { ok: false as const, error: "Question not found." };
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("attempts")
    .select("id")
    .eq("user_id", userId)
    .eq("question_key", key);
  if (!existing?.length) return { ok: false as const, error: "Those attempts are already gone." };
  const { error } = await supabase.from("attempts").delete().eq("user_id", userId).eq("question_key", key);
  if (error) return { ok: false as const, error: "Could not remove those attempts." };
  return { ok: true as const };
}

export async function addSuggestion(input: { userId: string | null; name: string; email: string; body: string }) {
  const body = input.body.trim().slice(0, 2000);
  if (body.length < 8) return { ok: false as const, error: "Write a suggestion of at least a few words." };
  const name = cleanName(input.name) || "Anonymous";
  const email = cleanEmail(input.email);
  const supabase = await createClient();
  const { error } = await supabase.from("suggestions").insert({
    user_id: input.userId,
    name,
    email,
    body,
  });
  if (error) return { ok: false as const, error: knownError(error, "Could not send the suggestion.") };
  return { ok: true as const };
}

export async function adminSuggestions(): Promise<SuggestionItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("suggestions")
    .select("id, name, email, body, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map((suggestion) => ({
    id: suggestion.id,
    name: suggestion.name,
    email: suggestion.email,
    body: suggestion.body,
    createdAt: suggestion.created_at,
  }));
}

export async function adminDeleteSuggestion(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("suggestions").delete().eq("id", id).select("id");
  if (error || !data?.length) return { ok: false as const, error: "That suggestion is already gone." };
  return { ok: true as const };
}
