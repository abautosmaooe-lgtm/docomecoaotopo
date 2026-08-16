import { db } from "../firebase";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from "firebase/firestore";

export interface PortalUserRecord {
  uid?: string;
  email: string;
  name?: string;
  photoUrl?: string;
  status: "approved" | "trial" | "suspended" | "pending";
  role?: "admin" | "vip" | "embaixador" | "anunciante" | "membro" | "leitor";
  trialEndsAt?: string;
  phone?: string;
  company?: string;
  createdAt?: string;
  lastLogin?: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
}

const LOCAL_STORAGE_USERS_KEY = "docomecoaotopo_portal_users";

export const DEFAULT_ADMIN_EMAILS = [
  "admin@docomecoaotopo.com.br",
  "diretoria@portal.com",
  "abautosmaooe@gmail.com",
  "reginasimoes@docomecoaotopo.com.br"
];

function getDocId(email: string): string {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
}

function getLocalUsers(): PortalUserRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Failed to read local users cache", e);
  }
  return [];
}

function saveLocalUsers(users: PortalUserRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn("Failed to save local users cache", e);
  }
}

/**
 * Syncs user to Firestore, Backend and LocalStorage
 */
export async function syncPortalUser(userData: {
  email: string;
  name?: string;
  photoUrl?: string;
  uid?: string;
  phone?: string;
  company?: string;
}): Promise<PortalUserRecord> {
  const cleanEmail = userData.email.toLowerCase().trim();
  const docId = getDocId(cleanEmail);
  const isAdmin = DEFAULT_ADMIN_EMAILS.includes(cleanEmail);

  let existing: Partial<PortalUserRecord> = {};

  // Try reading from Firestore client
  try {
    const userRef = doc(db, "portal_users", docId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existing = snap.data() as PortalUserRecord;
    }
  } catch (err) {
    console.warn("Firestore direct read error (will use cache/api):", err);
  }

  // If not found in firestore, check local storage
  if (!existing.email) {
    const localUsers = getLocalUsers();
    const found = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) existing = found;
  }

  const record: PortalUserRecord = {
    uid: userData.uid || existing.uid || docId,
    email: cleanEmail,
    name: userData.name || existing.name || cleanEmail.split("@")[0] || "Usuário",
    photoUrl: userData.photoUrl || existing.photoUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(cleanEmail)}`,
    status: isAdmin ? "approved" : (existing.status || "suspended"),
    role: isAdmin ? "admin" : (existing.role || "membro"),
    phone: userData.phone || existing.phone || "",
    company: userData.company || existing.company || "",
    createdAt: existing.createdAt || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    trialEndsAt: existing.trialEndsAt
  };

  // 1. Save directly to Firestore in both collections (portal_users and matriculas)
  try {
    const userRef = doc(db, "portal_users", docId);
    await setDoc(userRef, record, { merge: true });

    const matriculaRef = doc(db, "matriculas", docId);
    await setDoc(matriculaRef, {
      id: docId,
      email: cleanEmail,
      name: record.name,
      nome: record.name,
      phone: record.phone || "",
      whatsapp: record.phone || "",
      company: record.company || "",
      status: record.status,
      role: record.role,
      plano: record.role === "admin" ? "Diretoria (Admin)" : "Membro do Portal",
      createdAt: record.createdAt,
      lastLogin: record.lastLogin,
      uid: record.uid,
      photoUrl: record.photoUrl,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (fsErr) {
    console.warn("Firestore user/matricula sync error:", fsErr);
  }

  // 2. Try saving via API if server available
  try {
    await fetch("/api/users/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });
  } catch (apiErr) {
    // Expected on static Cloudflare Pages
  }

  // 3. Update local cache
  const localList = getLocalUsers().filter(u => u.email.toLowerCase() !== cleanEmail);
  localList.unshift(record);
  saveLocalUsers(localList);

  return record;
}

/**
 * Fetch all registered users from Firestore, API and LocalStorage
 */
export async function getAllPortalUsers(): Promise<PortalUserRecord[]> {
  const usersMap = new Map<string, PortalUserRecord>();

  // 1. Seed base default admin users
  const defaultSeeds: PortalUserRecord[] = [
    {
      email: "abautosmaooe@gmail.com",
      name: "Diretoria Master (Abautos)",
      photoUrl: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=abautosmaooe",
      status: "approved",
      role: "admin",
      createdAt: "2026-08-14T00:00:00.000Z"
    },
    {
      email: "diretoria@portal.com",
      name: "Diretoria Editorial",
      photoUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=diretoria",
      status: "approved",
      role: "admin",
      createdAt: "2026-08-14T00:00:00.000Z"
    },
    {
      email: "admin@docomecoaotopo.com.br",
      name: "Regina Simões (Admin)",
      photoUrl: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=reginasimoes",
      status: "approved",
      role: "admin",
      createdAt: "2026-08-14T00:00:00.000Z"
    }
  ];

  defaultSeeds.forEach(u => usersMap.set(u.email.toLowerCase(), u));

  // 2. Add local storage users
  getLocalUsers().forEach(u => {
    if (u && u.email) usersMap.set(u.email.toLowerCase(), u);
  });

  // 3. Fetch from Firestore client directly
  try {
    const colRef = collection(db, "portal_users");
    const snapshot = await getDocs(colRef);
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as PortalUserRecord;
      if (data && data.email) {
        usersMap.set(data.email.toLowerCase(), data);
      }
    });
  } catch (fsErr) {
    console.warn("Direct firestore list fetch error:", fsErr);
  }

  // 4. Try API if backend available
  try {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.users)) {
        data.users.forEach((u: PortalUserRecord) => {
          if (u && u.email) usersMap.set(u.email.toLowerCase(), u);
        });
      }
    }
  } catch (apiErr) {
    // Expected on static Cloudflare Pages
  }

  const list = Array.from(usersMap.values());
  list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  saveLocalUsers(list);
  return list;
}

/**
 * Updates a user's approval status, role or trial days
 */
export async function updatePortalUserStatus(
  email: string,
  newStatus: "approved" | "trial" | "suspended" | "pending",
  options?: {
    role?: "admin" | "vip" | "embaixador" | "anunciante" | "membro" | "leitor";
    trialDays?: number;
    approvedBy?: string;
    notes?: string;
    phone?: string;
  }
): Promise<{ success: boolean; user: PortalUserRecord }> {
  const cleanEmail = email.toLowerCase().trim();
  const docId = getDocId(cleanEmail);

  const updates: Partial<PortalUserRecord> = {
    email: cleanEmail,
    status: newStatus,
    approvedAt: newStatus === "approved" ? new Date().toISOString() : undefined,
    approvedBy: options?.approvedBy || "Admin Master"
  };

  if (options?.role) updates.role = options.role;
  if (options?.notes !== undefined) updates.notes = options.notes;
  if (options?.phone !== undefined) updates.phone = options.phone;

  if (newStatus === "trial") {
    const days = options?.trialDays || 14;
    updates.trialEndsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  // 1. Direct Firestore write to portal_users and matriculas
  try {
    const userRef = doc(db, "portal_users", docId);
    await setDoc(userRef, updates, { merge: true });

    const matriculaRef = doc(db, "matriculas", docId);
    await setDoc(matriculaRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (fsErr) {
    console.warn("Firestore status update direct error:", fsErr);
  }

  // 2. Call API if available
  try {
    await fetch(`/api/users/${encodeURIComponent(cleanEmail)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        role: options?.role,
        trialDays: options?.trialDays
      })
    });
  } catch (apiErr) {
    // Expected on static Cloudflare Pages
  }

  // 3. Update local cache
  const localList = getLocalUsers();
  let updatedRecord: PortalUserRecord = {
    email: cleanEmail,
    status: newStatus,
    createdAt: new Date().toISOString(),
    ...updates
  };

  const existingIdx = localList.findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (existingIdx >= 0) {
    updatedRecord = { ...localList[existingIdx], ...updates };
    localList[existingIdx] = updatedRecord;
  } else {
    localList.unshift(updatedRecord);
  }
  saveLocalUsers(localList);

  return { success: true, user: updatedRecord };
}

/**
 * Removes a user record from Firestore and LocalStorage
 */
export async function deletePortalUser(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const docId = getDocId(cleanEmail);

  try {
    await deleteDoc(doc(db, "portal_users", docId));
  } catch (e) {
    console.warn("Firestore delete user error:", e);
  }

  const filtered = getLocalUsers().filter(u => u.email.toLowerCase() !== cleanEmail);
  saveLocalUsers(filtered);
  return true;
}

/**
 * Formats a WhatsApp link to notify the user about their account status
 */
export function generateWhatsAppApprovalLink(user: PortalUserRecord, customPhone?: string): string {
  const phone = (customPhone || user.phone || "").replace(/\D/g, "");
  const userName = user.name || "Empreendedor(a)";
  
  let msg = `Olá *${userName}*! 👋\n\n`;
  if (user.status === "approved") {
    msg += `Temos ótimas notícias! Seu cadastro no *Portal Do Começo ao Topo* foi *APROVADO COM SUCESSO*! 🎉\n\n`;
    msg += `🔑 Você já tem acesso liberado a todas as matérias exclusivas, diretório de membros e benefícios da nossa Comunidade de Negócios.\n\n`;
    msg += `🌐 Acesse agora: https://docomecoaotopo.com.br\n\n`;
    msg += `Seja muito bem-vindo(a) ao ecossistema dos líderes de Juiz de Fora e região! 🚀`;
  } else if (user.status === "trial") {
    msg += `Seu período de *Teste Grátis (14 dias)* no *Portal Do Começo ao Topo* está ATIVO! ⏳\n\n`;
    msg += `🌐 Aproveite agora: https://docomecoaotopo.com.br\n\n`;
    msg += `Conte com nossa equipe para impulsionar seu negócio!`;
  } else {
    msg += `Recebemos sua solicitação de cadastro no *Portal Do Começo ao Topo* e estamos analisando seus dados. Em breve retornaremos!`;
  }

  const encodedMsg = encodeURIComponent(msg);
  if (phone) {
    return `https://wa.me/55${phone.startsWith("55") ? phone.slice(2) : phone}?text=${encodedMsg}`;
  }
  return `https://wa.me/?text=${encodedMsg}`;
}

/**
 * Formats a mailto link to send email notification
 */
export function generateEmailApprovalLink(user: PortalUserRecord): string {
  const userName = user.name || "Empreendedor(a)";
  const subject = encodeURIComponent("Seu Acesso ao Portal Do Começo ao Topo foi Aprovado! 🎉");
  
  const body = encodeURIComponent(
    `Olá ${userName},\n\n` +
    `Seu cadastro no Portal Do Começo ao Topo foi APROVADO pela nossa Diretoria!\n\n` +
    `Acesse agora o portal e aproveite todos os conteúdos e conexões:\n` +
    `https://docomecoaotopo.com.br\n\n` +
    `Atenciosamente,\n` +
    `Diretoria do Portal Do Começo ao Topo\n` +
    `Juiz de Fora - MG`
  );

  return `mailto:${user.email}?subject=${subject}&body=${body}`;
}

/**
 * Creates or updates an enrollment in Firestore collection 'matriculas'
 */
export async function saveMatriculaToFirestore(data: {
  name: string;
  whatsapp: string;
  plan: string;
  sector?: string;
  email?: string;
}): Promise<boolean> {
  try {
    const matriculaId = `mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const matriculaRef = doc(db, "matriculas", matriculaId);
    
    await setDoc(matriculaRef, {
      id: matriculaId,
      name: data.name,
      nome: data.name,
      whatsapp: data.whatsapp,
      phone: data.whatsapp,
      plan: data.plan,
      plano: data.plan,
      sector: data.sector || "Empreendedorismo",
      email: data.email || "",
      status: "pendente",
      createdAt: new Date().toISOString(),
      origem: "formulario_adesao"
    });
    return true;
  } catch (err) {
    console.warn("Error saving to matriculas collection in Firestore:", err);
    return false;
  }
}

/**
 * Loads all matriculas from Firestore collection 'matriculas'
 */
export async function getAllMatriculasFromFirestore(): Promise<any[]> {
  try {
    const colRef = collection(db, "matriculas");
    const snapshot = await getDocs(colRef);
    const results: any[] = [];
    snapshot.forEach(docSnap => {
      results.push({ id: docSnap.id, ...docSnap.data() });
    });
    return results.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  } catch (err) {
    console.warn("Error fetching from matriculas collection:", err);
    return [];
  }
}

/**
 * Creates or updates a Lead in Firestore collection 'leads' with 30 days trial
 */
export async function saveLeadToFirestore(data: {
  name: string;
  email: string;
  whatsapp: string;
  source?: string;
}): Promise<{ success: boolean; trialExpiresAt: string }> {
  const now = new Date();
  const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const leadPayload = {
    id: leadId,
    name: data.name,
    nome: data.name,
    email: data.email.toLowerCase().trim(),
    whatsapp: data.whatsapp,
    phone: data.whatsapp,
    source: data.source || "comunidade_30dias",
    status: "trial_30dias",
    createdAt: now.toISOString(),
    trialExpiresAt: trialExpiresAt
  };

  try {
    const leadRef = doc(db, "leads", leadId);
    await setDoc(leadRef, leadPayload);
  } catch (fsErr) {
    console.warn("Error persisting lead to Firestore:", fsErr);
  }

  // Also sync to backend API
  try {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadPayload)
    });
  } catch (apiErr) {
    console.warn("Error posting lead to /api/leads:", apiErr);
  }

  return { success: true, trialExpiresAt };
}

/**
 * Fetches all leads from Firestore or API
 */
export async function getAllLeadsFromFirestore(): Promise<any[]> {
  try {
    const colRef = collection(db, "leads");
    const snapshot = await getDocs(colRef);
    const results: any[] = [];
    snapshot.forEach(docSnap => {
      results.push({ id: docSnap.id, ...docSnap.data() });
    });
    if (results.length > 0) {
      return results.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }
  } catch (err) {
    console.warn("Error reading leads from Firestore, fallback to API:", err);
  }

  try {
    const res = await fetch("/api/leads");
    if (res.ok) {
      const data = await res.json();
      return data.leads || [];
    }
  } catch (e) {
    console.warn("Error fetching /api/leads:", e);
  }

  return [];
}

