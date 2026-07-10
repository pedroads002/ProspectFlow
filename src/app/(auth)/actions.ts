"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.email({ error: "Informe um e-mail válido." }),
  password: z
    .string()
    .min(8, { error: "A senha deve ter pelo menos 8 caracteres." }),
});

const signUpSchema = credentialsSchema.extend({
  name: z.string().min(1, { error: "Informe seu nome." }),
});

export type AuthFormState = { error: string } | undefined;

function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

function parseSignUp(formData: FormData) {
  return signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

/**
 * Supabase's Auth API returns English error messages by default. This maps
 * the common ones to Portuguese; anything unmapped falls back to a generic
 * ProspectFlow-authored message instead of leaking raw scaffold text.
 */
function translateAuthError(message: string): string {
  const known: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha inválidos.",
    "User already registered": "Este e-mail já está cadastrado.",
    "Email not confirmed": "Confirme seu e-mail antes de entrar.",
    "Signup requires a valid password": "Informe uma senha válida.",
  };

  if (known[message]) return known[message];
  if (/rate limit|too many/i.test(message)) {
    return "Muitas tentativas. Aguarde um momento e tente novamente.";
  }
  if (/password/i.test(message)) {
    return "Não foi possível validar a senha informada.";
  }
  if (/email/i.test(message)) {
    return "Não foi possível validar o e-mail informado.";
  }
  return "Não foi possível completar a operação. Tente novamente.";
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseSignUp(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { name, email, password } = parsed.data;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // Carried in Supabase Auth's own user_metadata and read by
    // modules/tenancy/auth.ts's ensureTenantAndUser to seed User.name on
    // first sign-in — no separate profile-capture step needed.
    options: { data: { full_name: name } },
  });
  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // Tenant + User are created lazily on first authenticated request — see
  // modules/tenancy/auth.ts's ensureTenantAndUser.
  redirect("/");
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
