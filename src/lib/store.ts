import {
  createHash,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { caseKeys, isCaseKey, isLevel1Set, practiceTitle } from "@/lib/catalog";

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

type UserRecord = PublicUser & {
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

type SessionRecord = {
  tokenHash: string;
  userId: string;
  expiresAt: string;
};

type ClassroomRecord = {
  id: string;
  name: string;
  instructorId: string;
  createdAt: string;
};

type MemberRecord = {
  classroomId: string;
  userId: string;
  addedAt: string;
};

type AttemptRecord = AttemptInput & {
  id: string;
  userId: string;
  createdAt: string;
};

type AssignmentRecord = {
  id: string;
  classroomId: string;
  practiceId: string;
  title: string;
  createdAt: string;
};

type CompletionRecord = {
  assignmentId: string;
  userId: string;
  completedAt: string;
  correct: number;
  total: number;
};

type CaseCheckRecord = {
  userId: string;
  caseKey: string;
  score: number;
  total: number;
  createdAt: string;
};

type StoreData = {
  users: UserRecord[];
  sessions: SessionRecord[];
  classrooms: ClassroomRecord[];
  members: MemberRecord[];
  attempts: AttemptRecord[];
  assignments: AssignmentRecord[];
  completions: CompletionRecord[];
  caseChecks: CaseCheckRecord[];
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function database() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !process.env.TRAINER_DB_SECRET) {
    throw new Error("Database is not configured.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function databaseSecret() {
  return process.env.TRAINER_DB_SECRET ?? "";
}

function emptyStore(): StoreData {
  return {
    users: [],
    sessions: [],
    classrooms: [],
    members: [],
    attempts: [],
    assignments: [],
    completions: [],
    caseChecks: [],
  };
}

function normalizeStore(value: Partial<StoreData> | null | undefined): StoreData {
  return {
    users: asArray<UserRecord>(value?.users),
    sessions: asArray<SessionRecord>(value?.sessions),
    classrooms: asArray<ClassroomRecord>(value?.classrooms),
    members: asArray<MemberRecord>(value?.members),
    attempts: asArray<AttemptRecord>(value?.attempts),
    assignments: asArray<AssignmentRecord>(value?.assignments),
    completions: asArray<CompletionRecord>(value?.completions),
    caseChecks: asArray<CaseCheckRecord>(value?.caseChecks),
  };
}

async function readStore(): Promise<{ version: number; data: StoreData }> {
  const { data, error } = await database().rpc("load_app_state", {
    app_secret: databaseSecret(),
  });
  if (error) throw new Error("Could not read accounts.");
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.version !== "number") throw new Error("Could not read accounts.");
  return { version: row.version, data: normalizeStore(row.data) };
}

async function writeStore(version: number, store: StoreData) {
  const { data, error } = await database().rpc("save_app_state", {
    app_secret: databaseSecret(),
    expected_version: version,
    payload: store,
  });
  if (error) throw new Error("Could not save accounts.");
  return data === true;
}

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const run = queue.then(job, job);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function update<T>(mutator: (store: StoreData) => Promise<T> | T): Promise<T> {
  return enqueue(async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const current = await readStore();
      const store = structuredClone(current.data);
      const result = await mutator(store);
      if (await writeStore(current.version, store)) return result;
    }
    throw new Error("Could not save accounts. Try again.");
  });
}

function read<T>(reader: (store: StoreData) => T): Promise<T> {
  return enqueue(async () => reader((await readStore()).data));
}

function hashPassword(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCb(password, salt, 32, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

function toPublic(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function cleanName(value: string) {
  return value.trim().slice(0, 80);
}

export function cleanEmail(value: string) {
  return value.trim().toLowerCase().slice(0, 254);
}

export function emailLooksValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function codesMatch(input: string, expected: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

function instructorCodeMatches(code: string) {
  const expected = process.env.INSTRUCTOR_CODE ?? "";
  if (!expected) return false;
  return codesMatch(code, expected);
}

function clip(value: string, max: number) {
  return value.trim().slice(0, max);
}

function practiceMatches(attemptPracticeId: string, assignmentPracticeId: string) {
  if (assignmentPracticeId === "level1") return attemptPracticeId.startsWith("level1:");
  if (assignmentPracticeId === "case-endings") {
    return attemptPracticeId.startsWith("case-endings:");
  }
  return attemptPracticeId === assignmentPracticeId;
}

function memberAssignments(store: StoreData, userId: string) {
  const classroomIds = new Set(
    store.members.filter((member) => member.userId === userId).map((member) => member.classroomId),
  );
  return store.assignments.filter((assignment) => classroomIds.has(assignment.classroomId));
}

function attemptsForAssignment(store: StoreData, userId: string, assignment: AssignmentRecord) {
  return store.attempts.filter(
    (attempt) =>
      attempt.userId === userId &&
      attempt.createdAt >= assignment.createdAt &&
      practiceMatches(attempt.practiceId, assignment.practiceId),
  );
}

function latestCaseChecks(store: StoreData, userId: string, since: string) {
  const checks = new Map<string, CaseCheckRecord>();
  for (const check of store.caseChecks) {
    if (check.userId !== userId || check.createdAt < since) continue;
    const previous = checks.get(check.caseKey);
    if (!previous || previous.createdAt <= check.createdAt) checks.set(check.caseKey, check);
  }
  return checks;
}

function upsertCompletion(
  store: StoreData,
  assignmentId: string,
  userId: string,
  correct: number,
  total: number,
) {
  const existing = store.completions.find(
    (completion) => completion.assignmentId === assignmentId && completion.userId === userId,
  );
  if (!existing) {
    store.completions.push({
      assignmentId,
      userId,
      completedAt: nowIso(),
      correct,
      total,
    });
    return "created" as const;
  }
  existing.correct = correct;
  existing.total = total;
  return "updated" as const;
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }> {
  const name = cleanName(input.name);
  const email = cleanEmail(input.email);
  if (!name) return { ok: false, error: "Enter your name." };
  if (!emailLooksValid(email)) return { ok: false, error: "Enter a valid email." };
  if (input.password.length < 8 || input.password.length > 72) {
    return { ok: false, error: "Password must be 8 to 72 characters." };
  }

  const salt = randomBytes(16);
  const passwordHash = (await hashPassword(input.password, salt)).toString("hex");
  const user: UserRecord = {
    id: crypto.randomUUID(),
    email,
    name,
    role: "student",
    passwordHash,
    passwordSalt: salt.toString("hex"),
    createdAt: nowIso(),
  };

  return update((store) => {
    if (store.users.some((existing) => existing.email === email)) {
      return { ok: false as const, error: "An account with that email already exists." };
    }
    store.users.push(user);
    return { ok: true as const, user: toPublic(user) };
  });
}

export async function authenticate(email: string, password: string) {
  const normalized = cleanEmail(email);
  const user = await read((store) => store.users.find((item) => item.email === normalized));
  if (!user || password.length < 1 || password.length > 72) {
    await hashPassword(password || "invalid", Buffer.alloc(16, 1));
    return null;
  }
  const actual = Buffer.from(user.passwordHash, "hex");
  const expected = await hashPassword(password, Buffer.from(user.passwordSalt, "hex"));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return toPublic(user);
}

export async function openSession(userId: string, remember: boolean) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + (remember ? 7 : 0.5) * 24 * 60 * 60 * 1000).toISOString();
  await update((store) => {
    const now = nowIso();
    store.sessions = store.sessions.filter((session) => session.expiresAt > now);
    store.sessions.push({ tokenHash: sha256(token), userId, expiresAt });
  });
  return { token, expiresAt };
}

export async function userForToken(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const tokenHash = sha256(token);
  return read((store) => {
    const session = store.sessions.find((item) => item.tokenHash === tokenHash);
    if (!session || session.expiresAt <= nowIso()) return null;
    const user = store.users.find((item) => item.id === session.userId);
    return user ? toPublic(user) : null;
  });
}

export async function deleteSessionToken(token: string) {
  const tokenHash = sha256(token);
  await update((store) => {
    store.sessions = store.sessions.filter((session) => session.tokenHash !== tokenHash);
  });
}

export async function promoteToInstructor(userId: string, code: string) {
  if (!process.env.INSTRUCTOR_CODE) {
    return { ok: false as const, error: "Instructor signup is not turned on." };
  }
  if (!instructorCodeMatches(code.trim())) {
    return { ok: false as const, error: "That instructor code is not valid." };
  }
  return update((store) => {
    const user = store.users.find((item) => item.id === userId);
    if (!user) return { ok: false as const, error: "Account not found." };
    user.role = "instructor";
    return { ok: true as const };
  });
}

export async function renameUser(userId: string, name: string) {
  const cleaned = cleanName(name);
  if (!cleaned) return { ok: false as const, error: "Enter your name." };
  return update((store) => {
    const user = store.users.find((item) => item.id === userId);
    if (!user) return { ok: false as const, error: "Account not found." };
    user.name = cleaned;
    return { ok: true as const };
  });
}

export async function replacePassword(userId: string, current: string, next: string) {
  if (next.length < 8 || next.length > 72) {
    return { ok: false as const, error: "Password must be 8 to 72 characters." };
  }
  const user = await read((store) => store.users.find((item) => item.id === userId));
  if (!user) return { ok: false as const, error: "Account not found." };
  const actual = Buffer.from(user.passwordHash, "hex");
  const expected = await hashPassword(current, Buffer.from(user.passwordSalt, "hex"));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return { ok: false as const, error: "Current password is incorrect." };
  }
  const salt = randomBytes(16);
  const passwordHash = (await hashPassword(next, salt)).toString("hex");
  await update((store) => {
    const record = store.users.find((item) => item.id === userId);
    if (!record) return;
    record.passwordSalt = salt.toString("hex");
    record.passwordHash = passwordHash;
  });
  return { ok: true as const };
}

export async function classroomsFor(instructorId: string): Promise<ClassroomSummary[]> {
  return read((store) =>
    store.classrooms
      .filter((classroom) => classroom.instructorId === instructorId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((classroom) => ({
        id: classroom.id,
        name: classroom.name,
        students: store.members.filter((member) => member.classroomId === classroom.id).length,
        assignments: store.assignments.filter((item) => item.classroomId === classroom.id).length,
      })),
  );
}

export async function createClassroom(instructorId: string, name: string) {
  const cleaned = cleanName(name);
  if (!cleaned) return { ok: false as const, error: "Enter a classroom name." };
  const classroom: ClassroomRecord = {
    id: crypto.randomUUID(),
    name: cleaned,
    instructorId,
    createdAt: nowIso(),
  };
  await update((store) => {
    store.classrooms.push(classroom);
  });
  return { ok: true as const, id: classroom.id };
}

export async function classroomForInstructor(
  instructorId: string,
  classroomId: string,
): Promise<ClassroomDetail | null> {
  return read((store) => {
    const classroom = store.classrooms.find(
      (item) => item.id === classroomId && item.instructorId === instructorId,
    );
    if (!classroom) return null;
    const members = store.members
      .filter((member) => member.classroomId === classroom.id)
      .map((member) => store.users.find((user) => user.id === member.userId))
      .filter((user): user is UserRecord => Boolean(user))
      .map(toPublic);
    const assignments = store.assignments
      .filter((assignment) => assignment.classroomId === classroom.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        practiceId: assignment.practiceId,
        rows: members.map((member) => {
          const completion = store.completions.find(
            (item) => item.assignmentId === assignment.id && item.userId === member.id,
          );
          return {
            userId: member.id,
            name: member.name,
            email: member.email,
            completedAt: completion?.completedAt ?? null,
            correct: completion?.correct ?? 0,
            total: completion?.total ?? 0,
          };
        }),
      }));
    return { id: classroom.id, name: classroom.name, members, assignments };
  });
}

export async function addClassroomMember(instructorId: string, classroomId: string, email: string) {
  const normalized = cleanEmail(email);
  if (!emailLooksValid(normalized)) return { ok: false as const, error: "Enter a valid email." };
  return update((store) => {
    const classroom = store.classrooms.find(
      (item) => item.id === classroomId && item.instructorId === instructorId,
    );
    if (!classroom) return { ok: false as const, error: "Classroom not found." };
    const user = store.users.find((item) => item.email === normalized);
    if (!user) return { ok: false as const, error: "No account uses that email yet." };
    const exists = store.members.some(
      (member) => member.classroomId === classroom.id && member.userId === user.id,
    );
    if (exists) return { ok: false as const, error: "That person is already in this classroom." };
    store.members.push({ classroomId: classroom.id, userId: user.id, addedAt: nowIso() });
    return { ok: true as const, message: `Added ${user.name}.` };
  });
}

export async function removeClassroomMember(
  instructorId: string,
  classroomId: string,
  userId: string,
) {
  return update((store) => {
    const classroom = store.classrooms.find(
      (item) => item.id === classroomId && item.instructorId === instructorId,
    );
    if (!classroom) return false;
    store.members = store.members.filter(
      (member) => !(member.classroomId === classroom.id && member.userId === userId),
    );
    const assignmentIds = new Set(
      store.assignments.filter((item) => item.classroomId === classroom.id).map((item) => item.id),
    );
    store.completions = store.completions.filter(
      (completion) => !(completion.userId === userId && assignmentIds.has(completion.assignmentId)),
    );
    return true;
  });
}

export async function assignPractice(instructorId: string, classroomId: string, practiceId: string) {
  const title = practiceTitle(practiceId);
  if (!title) return { ok: false as const, error: "Choose a practice." };
  return update((store) => {
    const classroom = store.classrooms.find(
      (item) => item.id === classroomId && item.instructorId === instructorId,
    );
    if (!classroom) return { ok: false as const, error: "Classroom not found." };
    const duplicate = store.assignments.some(
      (item) => item.classroomId === classroom.id && item.practiceId === practiceId,
    );
    if (duplicate) return { ok: false as const, error: "That practice is already assigned." };
    store.assignments.push({
      id: crypto.randomUUID(),
      classroomId: classroom.id,
      practiceId,
      title,
      createdAt: nowIso(),
    });
    return { ok: true as const, message: `Assigned ${title}.` };
  });
}

export async function studentAssignments(userId: string): Promise<StudentAssignment[]> {
  return read((store) =>
    memberAssignments(store, userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((assignment) => {
        const classroom = store.classrooms.find((item) => item.id === assignment.classroomId);
        const completion = store.completions.find(
          (item) => item.assignmentId === assignment.id && item.userId === userId,
        );
        return {
          id: assignment.id,
          title: assignment.title,
          practiceId: assignment.practiceId,
          classroomName: classroom?.name ?? "Classroom",
          completedAt: completion?.completedAt ?? null,
          correct: completion?.correct ?? 0,
          total: completion?.total ?? 0,
        };
      }),
  );
}

export async function missedQuestions(userId: string): Promise<MissedQuestion[]> {
  return read((store) => {
    const grouped = new Map<string, MissedQuestion & { lastWrongAt: string }>();
    for (const attempt of store.attempts) {
      if (attempt.userId !== userId) continue;
      const current = grouped.get(attempt.questionKey) ?? {
        questionKey: attempt.questionKey,
        practiceId: attempt.practiceId,
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
      current.practiceId = attempt.practiceId;
      if (attempt.correct) current.hits += 1;
      else {
        current.misses += 1;
        if (attempt.createdAt >= current.lastWrongAt) {
          current.lastWrongAt = attempt.createdAt;
          current.lastGiven = attempt.given || "No answer";
        }
      }
      grouped.set(attempt.questionKey, current);
    }
    return [...grouped.values()]
      .filter((item) => item.misses >= 2 && item.misses > item.hits)
      .sort((a, b) => b.misses - a.misses || b.lastWrongAt.localeCompare(a.lastWrongAt))
      .slice(0, 50)
      .map((item) => ({
        questionKey: item.questionKey,
        practiceId: item.practiceId,
        prompt: item.prompt,
        detail: item.detail,
        expected: item.expected,
        lastGiven: item.lastGiven,
        misses: item.misses,
        hits: item.hits,
      }));
  });
}

function sanitizeAttempt(input: AttemptInput): AttemptInput | null {
  const practiceId = clip(input.practiceId, 80);
  const questionKey = clip(input.questionKey, 180);
  const setMatch = /^level1:([a-z0-9_]+)$/.exec(practiceId);
  const levelKey = /^level1:(.+):(agree|ending|gender)$/.exec(questionKey);
  const casePractice = /^case-endings:([a-z]+)$/.exec(practiceId);
  const caseQuestion = /^case:([a-z]+):(masculine|feminine|neuter):(adjective|noun)$/.exec(
    questionKey,
  );
  const levelOk = Boolean(
    setMatch && levelKey && isLevel1Set(setMatch[1]) && levelKey[1].startsWith(`${setMatch[1]}-`),
  );
  const caseOk = Boolean(
    casePractice &&
      caseQuestion &&
      casePractice[1] === caseQuestion[1] &&
      isCaseKey(casePractice[1]),
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

function trimAttempts(store: StoreData, userId: string) {
  const own = store.attempts.filter((attempt) => attempt.userId === userId);
  if (own.length <= 2500) return;
  const keep = new Set(own.slice(-2500).map((attempt) => attempt.id));
  store.attempts = store.attempts.filter(
    (attempt) => attempt.userId !== userId || keep.has(attempt.id),
  );
}

export async function saveAttempt(userId: string, input: AttemptInput): Promise<ProgressResult> {
  const clean = sanitizeAttempt(input);
  if (!clean) return { ok: false, message: "" };
  await update((store) => {
    store.attempts.push({
      ...clean,
      id: crypto.randomUUID(),
      userId,
      createdAt: nowIso(),
    });
    trimAttempts(store, userId);
  });
  return { ok: true, message: "" };
}

export async function finishLevelRound(
  userId: string,
  setId: string,
  total: number,
): Promise<ProgressResult> {
  if (setId !== "all" && !isLevel1Set(setId)) return { ok: false, message: "" };
  if (!Number.isInteger(total) || total < 1 || total > 24) return { ok: false, message: "" };
  const roundPractice = setId === "all" ? "level1" : `level1:${setId}`;
  const recentSince = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

  return update((store) => {
    const recent = store.attempts.filter(
      (attempt) =>
        attempt.userId === userId &&
        attempt.createdAt >= recentSince &&
        practiceMatches(attempt.practiceId, roundPractice),
    );
    if (recent.length < total) return { ok: true, message: "Saved to your profile." };

    let created = 0;
    let updated = 0;
    let pending = 0;
    for (const assignment of memberAssignments(store, userId)) {
      const matches =
        setId === "all"
          ? assignment.practiceId === "level1"
          : assignment.practiceId === `level1:${setId}`;
      if (!matches) continue;
      const attempts = attemptsForAssignment(store, userId, assignment);
      if (attempts.length < total) {
        pending += 1;
        continue;
      }
      const correct = attempts.filter((attempt) => attempt.correct).length;
      const status = upsertCompletion(store, assignment.id, userId, correct, attempts.length);
      if (status === "created") created += 1;
      else updated += 1;
    }

    if (created) return { ok: true, message: "Marked done for your instructor." };
    if (pending) {
      return {
        ok: true,
        message: "Saved. Finish a full round after it was assigned and it will show as done.",
      };
    }
    if (updated) return { ok: true, message: "Updated the score your instructor can see." };
    return { ok: true, message: "Saved to your profile." };
  });
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
  const score = ready.filter((cell) => cell.correct).length;

  return update((store) => {
    const createdAt = nowIso();
    for (const cell of ready) {
      store.attempts.push({
        ...cell,
        practiceId: `case-endings:${caseKey}`,
        id: crypto.randomUUID(),
        userId,
        createdAt,
      });
    }
    trimAttempts(store, userId);
    store.caseChecks.push({ userId, caseKey, score, total: ready.length, createdAt });

    let created = 0;
    let updated = 0;
    let waiting = 0;
    for (const assignment of memberAssignments(store, userId)) {
      if (assignment.practiceId === `case-endings:${caseKey}`) {
        const checks = latestCaseChecks(store, userId, assignment.createdAt);
        const latest = checks.get(caseKey);
        if (!latest) continue;
        const status = upsertCompletion(store, assignment.id, userId, latest.score, latest.total);
        if (status === "created") created += 1;
        else updated += 1;
        continue;
      }
      if (assignment.practiceId === "case-endings") {
        const checks = latestCaseChecks(store, userId, assignment.createdAt);
        const keys = caseKeys();
        if (keys.some((key) => !checks.has(key))) {
          waiting += 1;
          continue;
        }
        const scoreSum = keys.reduce((sum, key) => sum + (checks.get(key)?.score ?? 0), 0);
        const totalSum = keys.reduce((sum, key) => sum + (checks.get(key)?.total ?? 0), 0);
        const status = upsertCompletion(store, assignment.id, userId, scoreSum, totalSum);
        if (status === "created") created += 1;
        else updated += 1;
      }
    }

    if (created && waiting) {
      return {
        ok: true,
        message: "Marked done. Check the other cases to finish the full case-endings assignment.",
      };
    }
    if (waiting) return { ok: true, message: "Saved. Check the other cases to finish the assignment." };
    if (created) return { ok: true, message: "Marked done for your instructor." };
    if (updated) return { ok: true, message: "Updated the score your instructor can see." };
    return { ok: true, message: "Saved to your profile." };
  });
}
