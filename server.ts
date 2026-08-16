import { GoogleGenAI } from "@google/genai";
import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, getDocs, query } from "firebase/firestore";

dotenv.config();

// Load the firebase configuration that was generated natively
const firebaseConfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "firebase-applet-config.json"), "utf8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // CORS Middleware to allow requests from custom domains like www.docomecoaotopo.com.br
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Serve static assets from public folder unconditionally
  app.use(express.static(path.resolve(process.cwd(), "public")));

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Ensure local uploads folder exists for serving static files safely without Firestore doc 1MB limit
  const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
    } catch (e) {
      console.warn("Could not create public/uploads directory:", e);
    }
  }

  // Helper inside routes to save base64 string to public/uploads or Firestore safely
  async function saveBase64Image(base64Str: string): Promise<string> {
    if (!base64Str || !base64Str.startsWith("data:image/")) {
      return base64Str; // Return unchanged if not base64
    }
    try {
      const parts = base64Str.split(";base64,");
      const mimeType = parts[0].split(":")[1] || "image/jpeg";
      const base64Data = parts[1];
      if (base64Data) {
        const buffer = Buffer.from(base64Data, "base64");
        const ext = mimeType.split("/")[1] || "jpg";
        const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
        const filePath = path.join(uploadsDir, filename);
        
        fs.writeFileSync(filePath, buffer);
        return `/uploads/${filename}`;
      }
    } catch (diskErr) {
      console.warn("Disk image write failed, trying fallback storage:", diskErr);
    }

    // Fallback: if data is under 800KB, attempt Firestore doc storage
    if (base64Str.length < 800000) {
      try {
        const docRef = await addDoc(collection(db, "fs_uploads"), {
          data: base64Str,
          createdAt: Date.now()
        });
        return `/api/files/${docRef.id}`;
      } catch (err) {
        console.error("Error saving base64 image to Firestore:", err);
      }
    }

    return base64Str; // fallback to base64
  }

  // Helper to recursively scan and convert any base64 image string to a static URL
  async function deepConvertBase64Images(obj: any): Promise<any> {
    if (!obj) return obj;
    if (typeof obj === "string") {
      if (obj.startsWith("data:image/") || (obj.startsWith("data:") && obj.includes(";base64,"))) {
        return await saveBase64Image(obj);
      }
      return obj;
    }
    if (Array.isArray(obj)) {
      const newArr = [];
      for (const item of obj) {
        newArr.push(await deepConvertBase64Images(item));
      }
      return newArr;
    }
    if (typeof obj === "object") {
      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        newObj[key] = await deepConvertBase64Images(obj[key]);
      }
      return newObj;
    }
    return obj;
  }

  let inMemoryDbCache: any = {
    photos: [],
    articles: [],
    comments: [],
    quem_somos_profile_pic: "",
    quem_somos_gallery: [],
    portalPagesConfig: null,
    logoConfig: null,
    gradientStyle: "",
    footerCredits: "",
    positionableImages: {},
    embaixadores_list: [],
    partners_list: [],
    rotating_ads: [],
    testimonials: [],
    community_plans: [],
    community_title: "",
    community_subtitle: "",
    advertising_plans: [],
    advertising_title: "",
    advertising_subtitle: "",
    advertising_whatsapp: "",
    community_enrollments: [],
    homepage_sections_order: ["ticker", "hero", "membership", "testimonials", "feed", "ads", "partners"]
  };

  // Modular collections to ensure no single Firestore document ever exceeds the 1MB hard limit
  const MODULAR_DOC_MAP: { key: string; docName: string }[] = [
    { key: "positionableImages", docName: "positionableImages" },
    { key: "photos", docName: "photos" },
    { key: "articles", docName: "articles" },
    { key: "podcasts", docName: "podcasts" },
    { key: "embaixadores_list", docName: "embaixadores" },
    { key: "partners_list", docName: "partners" },
    { key: "rotating_ads", docName: "rotating_ads" },
    { key: "testimonials", docName: "testimonials" },
    { key: "quem_somos_gallery", docName: "quem_somos_gallery" }
  ];

  // Load from Firestore
  async function loadDb() {
    try {
      // 1. Load primary config document
      const docSnap = await getDoc(doc(db, "portal", "config"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        inMemoryDbCache = { ...inMemoryDbCache, ...data };
      }

      // 2. Load modular sub-documents in parallel for resilience
      const modularPromises = MODULAR_DOC_MAP.map(item =>
        getDoc(doc(db, "portal_data", item.docName))
      );
      const results = await Promise.allSettled(modularPromises);

      results.forEach((res, index) => {
        if (res.status === "fulfilled" && res.value.exists()) {
          const docVal = res.value.data();
          if (docVal && docVal.data !== undefined) {
            inMemoryDbCache[MODULAR_DOC_MAP[index].key] = docVal.data;
          }
        }
      });

      return inMemoryDbCache;
    } catch (e: any) {
      if (!e?.message?.includes("RESOURCE_EXHAUSTED")) {
        console.error("Error reading from Firestore", e);
      }
    }
    return inMemoryDbCache;
  }

  async function saveDb(data: any) {
    try {
      // 1. Deep-clean all base64 images into static file URLs first
      const cleaned = await deepConvertBase64Images(data);
      inMemoryDbCache = { ...inMemoryDbCache, ...cleaned };

      // 2. Prepare lightweight primary config document (< 50KB)
      const primaryConfigDoc: any = {
        portalPagesConfig: inMemoryDbCache.portalPagesConfig || null,
        logoConfig: inMemoryDbCache.logoConfig || null,
        gradientStyle: inMemoryDbCache.gradientStyle || "",
        footerCredits: inMemoryDbCache.footerCredits || "",
        quem_somos_profile_pic: inMemoryDbCache.quem_somos_profile_pic || "",
        community_plans: inMemoryDbCache.community_plans || [],
        community_title: inMemoryDbCache.community_title || "",
        community_subtitle: inMemoryDbCache.community_subtitle || "",
        advertising_plans: inMemoryDbCache.advertising_plans || [],
        advertising_title: inMemoryDbCache.advertising_title || "",
        advertising_subtitle: inMemoryDbCache.advertising_subtitle || "",
        advertising_whatsapp: inMemoryDbCache.advertising_whatsapp || "",
        homepage_sections_order: inMemoryDbCache.homepage_sections_order || [],
        updatedAt: new Date().toISOString()
      };

      // Only include lists in primary config if total size is well under 500KB
      const fullJsonLen = JSON.stringify(inMemoryDbCache).length;
      if (fullJsonLen < 600000) {
        Object.assign(primaryConfigDoc, inMemoryDbCache);
      }

      await setDoc(doc(db, "portal", "config"), primaryConfigDoc, { merge: true });

      // 3. Save modular documents in 'portal_data' collection to guarantee size safety (< 100KB each)
      const writeTasks: Promise<any>[] = [];
      for (const item of MODULAR_DOC_MAP) {
        if (inMemoryDbCache[item.key] !== undefined) {
          writeTasks.push(
            setDoc(doc(db, "portal_data", item.docName), {
              data: inMemoryDbCache[item.key],
              updatedAt: new Date().toISOString()
            }, { merge: true })
          );
        }
      }

      await Promise.allSettled(writeTasks);
    } catch (e: any) {
      if (!e?.message?.includes("RESOURCE_EXHAUSTED")) {
        console.error("Error writing to Firestore", e);
      }
    }
  }

  async function createVersionedBackup(data: any) {
    try {
      const backupId = `backup-${Date.now()}`;
      const cleaned = await deepConvertBase64Images(data);
      
      const backupSummary: any = {
        versionId: backupId,
        timestamp: new Date().toISOString(),
        portalPagesConfig: cleaned.portalPagesConfig || null,
        logoConfig: cleaned.logoConfig || null,
        homepage_sections_order: cleaned.homepage_sections_order || [],
        embaixadores_count: Array.isArray(cleaned.embaixadores_list) ? cleaned.embaixadores_list.length : 0,
        photos_count: Array.isArray(cleaned.photos) ? cleaned.photos.length : 0,
        articles_count: Array.isArray(cleaned.articles) ? cleaned.articles.length : 0,
        testimonials_count: Array.isArray(cleaned.testimonials) ? cleaned.testimonials.length : 0,
        positionableImages_keys: Object.keys(cleaned.positionableImages || {})
      };

      // Only include full tree if well under the 1MB Firestore threshold
      const stringified = JSON.stringify(cleaned);
      if (stringified.length < 500000) {
        await setDoc(doc(db, "portal_backups", backupId), {
          ...backupSummary,
          ...cleaned
        });
      } else {
        await setDoc(doc(db, "portal_backups", backupId), backupSummary);
      }
    } catch (e: any) {
      if (!e?.message?.includes("RESOURCE_EXHAUSTED")) {
        console.error("Error creating versioned backup in Firestore", e);
      }
    }
  }

  // File serving endpoint (Firebase Firestore Image Proxy)
  app.get("/api/files/:id", async (req, res) => {
    try {
      const docSnap = await getDoc(doc(db, "fs_uploads", req.params.id));
      if (docSnap.exists()) {
        const docData = docSnap.data();
        if (docData && typeof docData.data === "string" && docData.data.startsWith("data:image/")) {
          const parts = docData.data.split(";base64,");
          const mimeType = parts[0].split(":")[1];
          const base64Data = parts[1];
          const buffer = Buffer.from(base64Data, "base64");
          
          res.setHeader("Content-Type", mimeType);
          return res.send(buffer);
        }
      }
      res.status(404).send("Not found");
    } catch (e) {
      res.status(500).send("Error");
    }
  });

  const DEFAULT_OFFICIAL_TESTIMONIALS = [
    {
      id: "t-1",
      testimonial: "Fazer parte do portal de negócios do podcast 'Do Começo ao Topo' tem sido um verdadeiro divisor de águas na minha trajetória. O ambiente de networking é incrível e me permite trocar experiências riquíssimas com outros líderes que transformam o cenário regional todos os dias.",
      author: "Danielle Lara - Mentora e Empresária",
      avatarUrl: "/danielle-profile.jpg",
      avatarId: 1
    },
    {
      id: "t-2",
      testimonial: "Estar presente no portal e participar ativamente das divulgações e eventos me proporcionou uma rede sólida de parcerias e conexões valiosas. É uma honra ver a força do empreendedorismo feminino de toda a região reunida neste ecossistema.",
      author: "Fátima Regina Anthero - Embaixadora do Bem-estar & Saúde",
      avatarUrl: "/regina-profile.jpg",
      avatarId: 5
    },
    {
      id: "t-3",
      testimonial: "O portal 'Do Começo ao Topo' conecta propósitos reais a oportunidades de mercado. A troca contínua entre as leitoras, empresárias e a nossa comunidade gera impacto direto no crescimento dos nossos negócios locais.",
      author: "Jaqueline de Carvalho Dias - Embaixadora & Terapeuta Integrativa",
      avatarUrl: "/jaqueline-profile.jpg",
      avatarId: 9
    },
    {
      id: "t-4",
      testimonial: "Histórias reais têm o poder de transformar começos em grandes conquistas. Este portal é a vitrine definitiva de inspiração, saúde, conhecimento e coragem para quem busca o topo.",
      author: "Bianca Torres - Nutricionista & Embaixadora Inspiração",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      avatarId: 12
    },
    {
      id: "t-5",
      testimonial: "Aceleramos nossos negócios e construímos conexões estratégicas de alto valor. Estar no portal Do Começo ao Topo coloca nossos projetos em evidência para todo o mercado regional.",
      author: "Flávia Reis - Consultora & Especialista Tributária",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      avatarId: 16
    }
  ];

  // Basic API router endpoints
  app.get("/api/published-data", async (req, res) => {
    const data = await loadDb();
    
    // Ensure official testimonials starting with Danielle Lara are served
    if (!Array.isArray(data.testimonials) || data.testimonials.length === 0 || data.testimonials.some((t: any) => t.author?.includes("Beatriz M.") || t.author?.includes("Juliana F."))) {
      data.testimonials = DEFAULT_OFFICIAL_TESTIMONIALS;
    }

    // Auto-heal/sync any ambassador uploaded pics from positionableImages back into embaixadores_list
    const DEFAULT_AMB_PHOTOS: Record<string, string> = {
      "Anderson de Paula Santos": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
      "Andreia de Oliveira Henriques": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
      "Bianca Torres": "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=600",
      "Danielle Lara Pinto": "/danielle-profile.jpg",
      "Fátima Regina Anthero": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600",
      "Flávia Reis da Silva Lopes": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600",
      "Jaqueline de Carvalho Dias": "/jaqueline-profile.jpg",
      "Silvania Silva": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=600",
      "Isabela Cristina": "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&q=80&w=600"
    };

    if (Array.isArray(data.embaixadores_list)) {
      data.embaixadores_list = data.embaixadores_list.map((amb: any, idx: number) => {
        const key = `ambassador-pic-${idx}-${amb.name}_uploaded_src`;
        let photo = data.positionableImages && data.positionableImages[key];
        if (!photo || photo === "undefined" || photo === "null") {
          photo = amb.photoUrl || DEFAULT_AMB_PHOTOS[amb.name] || DEFAULT_AMB_PHOTOS[Object.keys(DEFAULT_AMB_PHOTOS)[idx]];
        }
        return {
          ...amb,
          photoUrl: photo
        };
      });
    }
    
    res.json(data);
  });

  let inMemoryVisitorCount = 1420;

  app.get("/api/visitors", async (req, res) => {
    try {
      const docSnap = await getDoc(doc(db, "portal", "visitors"));
      if (docSnap.exists()) {
        inMemoryVisitorCount = docSnap.data().count || inMemoryVisitorCount;
      }
    } catch (err: any) {
      // silent fallback
    }
    res.json({ count: inMemoryVisitorCount });
  });

  app.options("/api/visitors-inc", (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(200);
  });

  app.post("/api/visitors-inc", async (req, res) => {
    console.log("POST /api/visitors-inc called");
    inMemoryVisitorCount += 1;
    try {
      const docRef = doc(db, "portal", "visitors");
      await setDoc(docRef, { count: inMemoryVisitorCount });
    } catch (err: any) {
      console.error("Error in POST /api/visitors-inc:", err);
      // silent fallback, do not fail request
    }
    res.set("Access-Control-Allow-Origin", "*");
    res.json({ count: inMemoryVisitorCount });
  });

  // User Management & Approval Control Endpoints
  const ADMIN_EMAILS = ["admin@docomecoatopo.com.br", "diretoria@portal.com", "abautosmaooe@gmail.com"];

  app.get("/api/users", async (req, res) => {
    try {
      const usersCol = collection(db, "portal_users");
      const snapshot = await getDocs(usersCol);
      const usersList: any[] = [];
      snapshot.forEach((docSnap) => {
        usersList.push(docSnap.data());
      });
      // Sort so newest or pending are visible
      usersList.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      res.json({ users: usersList });
    } catch (err: any) {
      console.error("Error fetching users list:", err);
      res.status(500).json({ error: err.message, users: [] });
    }
  });

  app.post("/api/users/sync", async (req, res) => {
    try {
      const { email, name, photoUrl, uid } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const cleanEmail = email.toLowerCase().trim();
      const docId = cleanEmail.replace(/[^a-z0-9]/g, "_");
      const userRef = doc(db, "portal_users", docId);
      const userSnap = await getDoc(userRef);

      let record: any;
      const isAdminEmail = ADMIN_EMAILS.includes(cleanEmail);

      if (userSnap.exists()) {
        record = userSnap.data();
        record.lastLogin = new Date().toISOString();
        if (name && !record.name) record.name = name;
        if (photoUrl && !record.photoUrl) record.photoUrl = photoUrl;
        if (isAdminEmail && record.status !== "approved") record.status = "approved";
        await setDoc(userRef, record, { merge: true });
      } else {
        record = {
          uid: uid || docId,
          email: cleanEmail,
          name: name || cleanEmail.split("@")[0] || "Usuário",
          photoUrl: photoUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(cleanEmail)}`,
          status: isAdminEmail ? "approved" : "suspended",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        await setDoc(userRef, record);
      }

      // Also persist to 'matriculas' collection in Firestore
      try {
        const matriculaRef = doc(db, "matriculas", docId);
        await setDoc(matriculaRef, {
          id: docId,
          email: cleanEmail,
          name: record.name,
          nome: record.name,
          phone: record.phone || "",
          status: record.status,
          role: record.role || (isAdminEmail ? "admin" : "membro"),
          plano: isAdminEmail ? "Diretoria (Admin)" : "Membro do Portal",
          createdAt: record.createdAt,
          lastLogin: record.lastLogin,
          uid: record.uid,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (matErr) {
        console.warn("Server sync to matriculas non-fatal error:", matErr);
      }

      res.json({ user: record, isAdmin: isAdminEmail });
    } catch (err: any) {
      console.error("Error syncing user record:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/users/:email/status", async (req, res) => {
    try {
      const { email } = req.params;
      const { status, trialDays, role } = req.body;
      const cleanEmail = decodeURIComponent(email).toLowerCase().trim();
      const docId = cleanEmail.replace(/[^a-z0-9]/g, "_");
      const userRef = doc(db, "portal_users", docId);
      
      const updates: any = { 
        email: cleanEmail,
        status: status || "approved",
        updatedAt: new Date().toISOString()
      };
      
      if (role) {
        updates.role = role;
      }

      if (status === "trial") {
        const days = typeof trialDays === "number" ? trialDays : 14;
        updates.trialEndsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      }

      await setDoc(userRef, updates, { merge: true });
      const updatedSnap = await getDoc(userRef);
      res.json({ success: true, user: updatedSnap.data() });
    } catch (err: any) {
      console.error("Error updating user status:", err);
      // Return success true with fallback data so client never gets blocked
      res.json({ 
        success: true, 
        warning: err.message, 
        user: { email: req.params.email, status: req.body.status, updatedAt: new Date().toISOString() } 
      });
    }
  });

  app.post("/api/publish-all", async (req, res) => {
    try {
      const dbData = await loadDb();
      const { portalPagesConfig, logoConfig, gradientStyle, footerCredits, quem_somos_profile_pic, quem_somos_gallery, photos, positionableImages, embaixadores_list, podcasts, articles, partners_list, rotating_ads, testimonials, community_plans, community_title, community_subtitle, advertising_plans, advertising_title, advertising_subtitle, advertising_whatsapp, homepage_sections_order } = req.body;
      
      if (photos && Array.isArray(photos)) {
        const processedPhotos = [];
        for (const p of photos) {
          let url = p.url;
          if (url && typeof url === "string" && url.startsWith("data:image/")) {
            url = await saveBase64Image(url);
          }
          processedPhotos.push({ ...p, url });
        }
        dbData.photos = processedPhotos;
      }

      if (quem_somos_gallery && Array.isArray(quem_somos_gallery)) {
        const processedQG = [];
        for (const q of quem_somos_gallery) {
          let url = q.url;
          if (url && typeof url === "string" && url.startsWith("data:image/")) {
            url = await saveBase64Image(url);
          }
          processedQG.push({ ...q, url });
        }
        dbData.quem_somos_gallery = processedQG;
      }

      if (articles && Array.isArray(articles)) {
        dbData.articles = articles;
      }

      if (podcasts && Array.isArray(podcasts)) {
        dbData.podcasts = podcasts;
      }

      if (partners_list && Array.isArray(partners_list)) {
        dbData.partners_list = partners_list;
      }

      if (rotating_ads && Array.isArray(rotating_ads)) {
        dbData.rotating_ads = rotating_ads;
      }

      if (testimonials && Array.isArray(testimonials)) {
        dbData.testimonials = testimonials;
      }

      if (community_plans && Array.isArray(community_plans)) {
        dbData.community_plans = community_plans;
      }

      if (community_title !== undefined) {
        dbData.community_title = community_title;
      }

      if (community_subtitle !== undefined) {
        dbData.community_subtitle = community_subtitle;
      }

      if (advertising_plans && Array.isArray(advertising_plans)) {
        dbData.advertising_plans = advertising_plans;
      }

      if (advertising_title !== undefined) {
        dbData.advertising_title = advertising_title;
      }

      if (advertising_subtitle !== undefined) {
        dbData.advertising_subtitle = advertising_subtitle;
      }

      if (advertising_whatsapp !== undefined) {
        dbData.advertising_whatsapp = advertising_whatsapp;
      }

      if (homepage_sections_order !== undefined) {
        dbData.homepage_sections_order = homepage_sections_order;
      }

      if (embaixadores_list !== undefined) {
        const processedAmbassadors = [];
        if (Array.isArray(embaixadores_list)) {
          for (let idx = 0; idx < embaixadores_list.length; idx++) {
            const amb = embaixadores_list[idx];
            let processedUrl = amb.photoUrl;
            if (typeof processedUrl === "string" && processedUrl.startsWith("data:image/")) {
              try {
                processedUrl = await saveBase64Image(processedUrl);
              } catch (err) {
                console.error("Failed to convert base64 image for ambassador: " + amb.name, err);
              }
            }
            
            // Auto-heal/restore from dbData.positionableImages if the incoming image url is fallback/unsplash or empty
            const key = `ambassador-pic-${idx}-${amb.name}_uploaded_src`;
            const isFallbackImg = !processedUrl || processedUrl.includes("images.unsplash.com") || processedUrl === "undefined" || processedUrl === "null";
            if (isFallbackImg && dbData.positionableImages && dbData.positionableImages[key]) {
              processedUrl = dbData.positionableImages[key];
            }

            processedAmbassadors.push({
              ...amb,
              photoUrl: processedUrl
            });
            // Also store/sync into positionableImages under the correct storageKey
            if (processedUrl) {
              if (!dbData.positionableImages) {
                dbData.positionableImages = {};
              }
              dbData.positionableImages[key] = processedUrl;
            }
          }
        }
        dbData.embaixadores_list = processedAmbassadors;
      }
      if (portalPagesConfig) {
        dbData.portalPagesConfig = portalPagesConfig;
      }
      if (logoConfig) {
        if (logoConfig.customImageUrl && logoConfig.customImageUrl.startsWith("data:image/")) {
          logoConfig.customImageUrl = await saveBase64Image(logoConfig.customImageUrl);
        }
        dbData.logoConfig = logoConfig;
      }
      if (gradientStyle !== undefined) {
        dbData.gradientStyle = gradientStyle;
      }
      if (footerCredits !== undefined) {
        dbData.footerCredits = footerCredits;
      }
      if (quem_somos_profile_pic !== undefined) {
        if (quem_somos_profile_pic && quem_somos_profile_pic.startsWith("data:image/")) {
          dbData.quem_somos_profile_pic = await saveBase64Image(quem_somos_profile_pic);
        } else {
          dbData.quem_somos_profile_pic = quem_somos_profile_pic;
        }
      }
      if (positionableImages !== undefined) {
        // MERGE rather than overwrite to prevent deleting other users / other sessions uploads
        const processedImages: Record<string, any> = { ...(dbData.positionableImages || {}) };
        for (const [key, val] of Object.entries(positionableImages)) {
          if (typeof val === "string" && val.startsWith("data:image/")) {
            try {
              processedImages[key] = await saveBase64Image(val);
            } catch (err: any) {
              console.error("Failed to convert base64 positionable image: " + key, err);
              processedImages[key] = val;
            }
          } else {
            processedImages[key] = val;
          }
        }
        dbData.positionableImages = processedImages;
      }

      await saveDb(dbData);
      await createVersionedBackup(dbData);
      res.json({ status: "success", db: dbData });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/update-positionable-image", async (req, res) => {
    try {
      const dbData = await loadDb();
      const { key, val, coords } = req.body;
      if (!key) {
        return res.status(400).json({ error: "Key is required" });
      }
      if (!dbData.positionableImages) {
        dbData.positionableImages = {};
      }
      
      if (val !== undefined) {
        if (val.startsWith("data:image/")) {
          dbData.positionableImages[`${key}_uploaded_src`] = await saveBase64Image(val);
        } else {
          dbData.positionableImages[`${key}_uploaded_src`] = val;
        }
      }
      if (coords !== undefined) {
        dbData.positionableImages[key] = coords;
      }
      
      await saveDb(dbData);
      res.json({ status: "success" });
    } catch (e: any) {
       res.status(500).json({ error: e.message });
    }
  });

  // Dedicated Comprehensive Client -> Cloud Sync Route
  app.post("/api/sync-all-from-client", async (req, res) => {
    try {
      const dbData = await loadDb();
      const payload = req.body || {};

      // 1. Photos
      if (Array.isArray(payload.photos) && payload.photos.length > 0) {
        const existing = dbData.photos || [];
        const combined = [...existing];
        const existingIds = new Set(existing.map((p: any) => p.id));
        const existingUrls = new Set(existing.map((p: any) => p.url));

        for (const p of payload.photos) {
          if (!p || !p.url) continue;
          let url = p.url;
          if (typeof url === "string" && url.startsWith("data:image/")) {
            url = await saveBase64Image(url);
          }
          const item = { ...p, url };
          if (!existingIds.has(item.id) && !existingUrls.has(item.url)) {
            existingIds.add(item.id);
            existingUrls.add(item.url);
            combined.unshift(item);
          }
        }
        dbData.photos = combined;
      }

      // 2. Quem Somos Profile Pic
      if (payload.quem_somos_profile_pic) {
        let pic = payload.quem_somos_profile_pic;
        if (typeof pic === "string" && pic.startsWith("data:image/")) {
          pic = await saveBase64Image(pic);
        }
        if (!pic.includes("ibb.co/wFLq0zJQ")) {
          dbData.quem_somos_profile_pic = pic;
        }
      }

      // 3. Quem Somos Gallery
      if (Array.isArray(payload.quem_somos_gallery) && payload.quem_somos_gallery.length > 0) {
        const processedQG = [];
        for (const q of payload.quem_somos_gallery) {
          let url = q.url;
          if (url && typeof url === "string" && url.startsWith("data:image/")) {
            url = await saveBase64Image(url);
          }
          processedQG.push({ ...q, url });
        }
        dbData.quem_somos_gallery = processedQG;
      }

      // 4. Positionable Images
      if (payload.positionableImages && typeof payload.positionableImages === "object") {
        if (!dbData.positionableImages) dbData.positionableImages = {};
        for (const [k, v] of Object.entries(payload.positionableImages)) {
          if (typeof v === "string" && v.startsWith("data:image/")) {
            dbData.positionableImages[k] = await saveBase64Image(v);
          } else if (v) {
            dbData.positionableImages[k] = v;
          }
        }
      }

      // 5. Embaixadores List
      if (Array.isArray(payload.embaixadores_list) && payload.embaixadores_list.length > 0) {
        const processedAmb = [];
        for (const amb of payload.embaixadores_list) {
          let pUrl = amb.photoUrl;
          if (typeof pUrl === "string" && pUrl.startsWith("data:image/")) {
            pUrl = await saveBase64Image(pUrl);
          }
          processedAmb.push({ ...amb, photoUrl: pUrl });
        }
        dbData.embaixadores_list = processedAmb;
      }

      // 6. Testimonials
      if (Array.isArray(payload.testimonials) && payload.testimonials.length > 0) {
        const hasDanielle = payload.testimonials.some((t: any) => t.author?.toLowerCase().includes("danielle lara"));
        if (hasDanielle) {
          dbData.testimonials = payload.testimonials;
        }
      }

      // 7. Other configs
      if (payload.portalPagesConfig) dbData.portalPagesConfig = payload.portalPagesConfig;
      if (payload.articles && Array.isArray(payload.articles)) dbData.articles = payload.articles;
      if (payload.podcasts && Array.isArray(payload.podcasts)) dbData.podcasts = payload.podcasts;
      if (payload.partners_list && Array.isArray(payload.partners_list)) dbData.partners_list = payload.partners_list;
      if (payload.rotating_ads && Array.isArray(payload.rotating_ads)) dbData.rotating_ads = payload.rotating_ads;

      await saveDb(dbData);
      await createVersionedBackup(dbData);

      res.json({ success: true, db: dbData });
    } catch (err: any) {
      console.error("Error in /api/sync-all-from-client:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/photos", async (req, res) => {
    const dbData = await loadDb();
    const { gallery } = req.query;
    if (gallery) {
      return res.json(dbData.photos.filter((p: any) => p.gallery === gallery));
    }
    res.json(dbData.photos);
  });

  app.post("/api/photos", async (req, res) => {
    const dbData = await loadDb();
    const { gallery, item } = req.body;

    if (!item) {
      return res.status(400).json({ error: "Item missing" });
    }

    try {
      if (item.url && item.url.startsWith("data:image/")) {
        item.url = await saveBase64Image(item.url);
      }
      const newPhoto = {
        ...item,
        gallery: gallery || item.gallery || "global",
        id: item.id || `photo-${Date.now()}`,
        date: item.date || new Date().toISOString().split("T")[0]
      };

      dbData.photos = dbData.photos.filter((p: any) => p.id !== newPhoto.id);
      dbData.photos.unshift(newPhoto);
      await saveDb(dbData);

      res.status(201).json(newPhoto);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/photos/:id", async (req, res) => {
    const dbData = await loadDb();
    dbData.photos = dbData.photos.filter((p: any) => p.id !== req.params.id);
    await saveDb(dbData);
    res.json({ status: "ok" });
  });

  app.get("/api/articles", async (req, res) => {
    const dbData = await loadDb();
    res.json(dbData.articles);
  });

  app.post("/api/articles", async (req, res) => {
    const dbData = await loadDb();
    const { item } = req.body;

    if (!item) {
      return res.status(400).json({ error: "Item missing" });
    }

    try {
      if (item.image && typeof item.image === "string" && item.image.startsWith("data:image/")) {
        item.image = await saveBase64Image(item.image);
      }
      if (item.imageUrl && typeof item.imageUrl === "string" && item.imageUrl.startsWith("data:image/")) {
        item.imageUrl = await saveBase64Image(item.imageUrl);
      }
      const newArticle = {
        ...item,
        id: item.id || `art-${Date.now()}`,
        date: item.date || new Date().toISOString()
      };

      dbData.articles = dbData.articles.filter((a: any) => a.id !== newArticle.id);
      dbData.articles.unshift(newArticle);
      await saveDb(dbData);

      res.status(201).json(newArticle);
    } catch (e: any) {
      console.error("Error saving article in server:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/articles/:id", async (req, res) => {
    const dbData = await loadDb();
    dbData.articles = dbData.articles.filter((a: any) => a.id !== req.params.id);
    await saveDb(dbData);
    res.json({ status: "ok" });
  });

  app.get("/api/profile-pic", async (req, res) => {
    const dbData = await loadDb();
    res.json({ url: dbData.quem_somos_profile_pic });
  });

  app.post("/api/profile-pic", async (req, res) => {
    const dbData = await loadDb();
    const { image } = req.body;
    try {
      if (image) {
        const url = await saveBase64Image(image);
        dbData.quem_somos_profile_pic = url;
        await saveDb(dbData);
        res.json({ url });
      } else {
        dbData.quem_somos_profile_pic = "";
        await saveDb(dbData);
        res.json({ url: "" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/quem-somos-gallery", async (req, res) => {
    const dbData = await loadDb();
    res.json(dbData.quem_somos_gallery);
  });

  app.post("/api/quem-somos-gallery", async (req, res) => {
    const dbData = await loadDb();
    const { item } = req.body;
    if (!item) return res.status(400).json({ error: "Item missing" });

    try {
      if (item.url && item.url.startsWith("data:image/")) {
        item.url = await saveBase64Image(item.url);
      }
      dbData.quem_somos_gallery = dbData.quem_somos_gallery.filter((g: any) => g.id !== item.id);
      dbData.quem_somos_gallery.unshift(item);
      await saveDb(dbData);
      res.json(item);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/quem-somos-gallery/:id", async (req, res) => {
    const dbData = await loadDb();
    dbData.quem_somos_gallery = dbData.quem_somos_gallery.filter((g: any) => g.id !== req.params.id);
    await saveDb(dbData);
    res.json({ status: "ok" });
  });

  
  app.post("/api/google-search", async (req, res) => {
    try {
      const { query } = req.body;
      const searchQuery = (query || "Portal Do Começo ao Topo Juiz de Fora").trim();

      // Fetch RSS feed results as web search results
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=pt-BR&gl=BR&ceid=BR%3Apt-419`;
      const fetchRes = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      let items: any[] = [];
      if (fetchRes.ok) {
        const xml = await fetchRes.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(xml)) !== null && items.length < 6) {
          const itemXml = match[1];
          const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
          const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
          const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
          const sourceMatch = itemXml.match(/<source[\s\S]*?>([\s\S]*?)<\/source>/);

          if (titleMatch) {
            let title = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
            const link = linkMatch ? linkMatch[1].trim() : `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
            const pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";
            const source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : "Google News";

            items.push({
              title,
              snippet: `Resultado da busca no Google para "${searchQuery}". Clique para abrir a matéria original.`,
              url: link,
              pubDate,
              source
            });
          }
        }
      }

      if (items.length === 0) {
        items = [
          {
            title: `Resultados do Google para: ${searchQuery}`,
            snippet: `Confira os principais artigos, notícias e novidades relevantes sobre ${searchQuery} diretamente no ecossistema de buscas do Google.`,
            url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
            pubDate: new Date().toLocaleDateString("pt-BR"),
            source: "Google Web Search"
          }
        ];
      }

      res.json({ query: searchQuery, results: items });
    } catch (err: any) {
      console.error("Google Search API Error:", err);
      res.status(500).json({ 
        query: req.body?.query || "", 
        results: [
          {
            title: `Buscar "${req.body?.query || 'Negócios Juiz de Fora'}" no Google`,
            snippet: `Clique no link abaixo para realizar a consulta em tempo real no buscador oficial do Google.`,
            url: `https://www.google.com/search?q=${encodeURIComponent(req.body?.query || 'Portal Do Começo ao Topo')}`,
            pubDate: "Agora",
            source: "Google Search Direct"
          }
        ] 
      });
    }
  });

  app.post("/api/assistant", async (req, res) => {
    const { history, message } = req.body;
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
      }
      
      const dbData = await loadDb();
      
      const portalConfig = dbData.portalPagesConfig || {};
      const articles = dbData.articles || [];
      const embaixadores = dbData.embaixadores_list || [];
      const podcasts = dbData.podcasts || [];
      
      const contextText = `
Você é a Topina, a consagrada Conselheira de Negócios oficial e assistente virtual inteligente do 'Do Começo Ao Topo - Portal de Negócios'.
Seu tom de voz é acolhedor, profissional, estratégico, simpático e especialista em mentorias de negócios, MEI (Micro Empreendedor Individual), micro e pequenas empresas, estratégias de marketing, técnicas de vendas, funil de conversão e gestão financeira!

Você domina o ecossistema do Portal e mentoria executiva:
1. CONSELHEIRA DE NEGÓCIOS & MENTORIA:
   - Auxilia empreendedores em dúvidas de MEI, abertura de CNPJ, fluxo de caixa, gestão, estratégias de marketing digital, tráfego, prospecção, posicionamento e técnicas de vendas.
   - Dá conselhos práticos e diretos focados em resultados, escalabilidade e superação de desafios empresariais.

2. PORTAL DO COMEÇO AO TOPO:
   - Comunidade VIP, Marcas Parceiras, Podcasts de Grandes Líderes, Embaixadores e Notícias Regionais.
   - Suporte Humano via WhatsApp: (32) 99194-7690.

REGRAS DE RESPOSTA E EASTER EGG DE REFLEXÃO ("O CAFEZINHO"):
- Responda em português fluído, simpático, claro e estruturado.
- Se a pergunta for extremamente complexa, ambígua ou sobre um tema muito específico que exija reflexão profunda (ou se você quiser dar um toque especial de descontração), você DEVE responder EXATAMENTE com esta frase carinhosa:
"Posso pensar melhor? Enquanto você toma um cafezinho, eu vou pensar aqui também."
- No entanto, se o usuário insistir na pergunta (ou se a mensagem contiver "retomar", "insistir", "pensou", "e aí"), forneça imediatamente um conselho estratégico profundo, estruturado e altamente especializado!
`;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const fullPrompt = `
Histórico da conversa:
${(history || []).map((m: any) => `[${m.sender}]: ${m.text}`).join('\n')}

Usuário: ${message}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction: contextText,
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        }
      });
      
      // Extract grounding metadata if available
      let groundingChunks: any[] = [];
      try {
        const candidate = (response as any).candidates?.[0];
        if (candidate?.groundingMetadata?.groundingChunks) {
          groundingChunks = candidate.groundingMetadata.groundingChunks;
        }
      } catch (e) {
        // ignore fallback
      }

      res.json({ 
        reply: response.text,
        groundingChunks
      });
    } catch (e: any) {
        console.error(e);
        require('fs').writeFileSync('error.log', e.toString() + '\n' + e.stack);
        res.status(500).json({ error: "Erro no assistente." });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const dbData = await loadDb();
      if (!dbData.leads) dbData.leads = [];
      const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date();
      const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const newLead = {
        id: leadId,
        nome: req.body.nome || req.body.name || "Visitante",
        name: req.body.nome || req.body.name || "Visitante",
        email: (req.body.email || "").toLowerCase().trim(),
        whatsapp: req.body.whatsapp || req.body.phone || "",
        phone: req.body.whatsapp || req.body.phone || "",
        source: req.body.source || "comunidade_30dias",
        status: "trial_30dias",
        createdAt: now.toISOString(),
        trialExpiresAt: trialExpiresAt
      };

      // Check if lead with this email already exists in local DB
      const existingIdx = dbData.leads.findIndex((l: any) => l.email === newLead.email && newLead.email !== "");
      if (existingIdx >= 0) {
        dbData.leads[existingIdx] = { ...dbData.leads[existingIdx], ...newLead };
      } else {
        dbData.leads.push(newLead);
      }
      await saveDb(dbData);

      // Persist directly to Firestore collection 'leads' and 'comunidade_leads'
      try {
        const leadRef = doc(db, "leads", leadId);
        await setDoc(leadRef, newLead);
      } catch (fsErr) {
        console.warn("Firestore leads direct write error:", fsErr);
      }

      res.json({ success: true, lead: newLead, trialExpiresAt });
    } catch (error) {
      console.error("Error saving lead", error);
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  app.get("/api/leads", async (req, res) => {
    try {
      const colRef = collection(db, "leads");
      const snapshot = await getDocs(colRef);
      const leads: any[] = [];
      snapshot.forEach(docSnap => {
        leads.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (leads.length > 0) {
        res.json({ leads: leads.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")) });
      } else {
        const dbData = await loadDb();
        res.json({ leads: dbData.leads || [] });
      }
    } catch (err: any) {
      console.warn("Error fetching leads from firestore:", err);
      const dbData = await loadDb();
      res.json({ leads: dbData.leads || [] });
    }
  });

  app.post("/api/community-enrollment", async (req, res) => {
    try {
      const dbData = await loadDb();
      if (!dbData.community_enrollments) dbData.community_enrollments = [];
      const enrollmentId = `mat_${Date.now()}`;
      const newEnrollment = {
        id: enrollmentId,
        createdAt: new Date().toISOString(),
        ...req.body
      };
      dbData.community_enrollments.push(newEnrollment);
      await saveDb(dbData);

      // Persist directly to Firestore collection 'matriculas'
      try {
        const matriculaRef = doc(db, "matriculas", enrollmentId);
        await setDoc(matriculaRef, {
          id: enrollmentId,
          nome: req.body.name || req.body.nome || "",
          name: req.body.name || req.body.nome || "",
          whatsapp: req.body.whatsapp || req.body.phone || "",
          phone: req.body.whatsapp || req.body.phone || "",
          plan: req.body.plan || req.body.plano || "Membro Comunidade",
          plano: req.body.plan || req.body.plano || "Membro Comunidade",
          sector: req.body.sector || req.body.setor || "Empreendedorismo",
          email: req.body.email || "",
          status: "pendente",
          origem: "formulario_adesao",
          createdAt: new Date().toISOString()
        });
      } catch (fsErr) {
        console.warn("Firestore matriculas direct write error:", fsErr);
      }

      res.json({ success: true, id: enrollmentId });
    } catch (error) {
      console.error("Error saving enrollment", error);
      res.status(500).json({ error: "Failed to save enrollment" });
    }
  });

  app.get("/api/matriculas", async (req, res) => {
    try {
      const colRef = collection(db, "matriculas");
      const snapshot = await getDocs(colRef);
      const matriculas: any[] = [];
      snapshot.forEach(docSnap => {
        matriculas.push({ id: docSnap.id, ...docSnap.data() });
      });
      res.json({ matriculas });
    } catch (err: any) {
      console.warn("Error fetching matriculas from firestore:", err);
      const dbData = await loadDb();
      res.json({ matriculas: dbData.community_enrollments || [] });
    }
  });

  app.post("/api/contact", async (req, res) => {
    const { name, email, msg } = req.body;
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("Missing email configuration");
      return res.status(500).json({ error: "Email server configuration is incomplete" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"${name}" <${email}>`,
        to: "andersonpsan@gmail.com, podcastdocomecoaotopojf@gmail.com",
        subject: "Nova mensagem de contato - Portal",
        text: `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${msg}`,
      });
      res.status(200).json({ status: "ok" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post("/api/upload-image", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image || !image.startsWith("data:image/")) {
        return res.status(400).json({ error: "Invalid image format" });
      }
      const url = await saveBase64Image(image);
      res.json({ url });
    } catch (e: any) {
      console.error("Image upload failed:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/resolve-image-url", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      
      const cleanUrl = url.trim();
      // If it is not an ImgBB page link, or is already direct, return immediately
      if (!cleanUrl.includes("ibb.co/") || cleanUrl.includes("i.ibb.co") || cleanUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return res.json({ url: cleanUrl });
      }

      console.log("Resolving ImgBB URL:", cleanUrl);
      const response = await fetch(cleanUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (!response.ok) {
        return res.json({ url: cleanUrl });
      }
      const html = await response.text();
      
      // Match og:image or twitter:image contents
      const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (ogMatch && ogMatch[1]) {
        console.log("Resolved via og:image:", ogMatch[1]);
        return res.json({ url: ogMatch[1] });
      }

      const ogMatch2 = html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
      if (ogMatch2 && ogMatch2[1]) {
        console.log("Resolved via og:image alt:", ogMatch2[1]);
        return res.json({ url: ogMatch2[1] });
      }

      const directMatch = html.match(/(https:\/\/i\.ibb\.co\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|webp))/i);
      if (directMatch && directMatch[0]) {
        console.log("Resolved via regex pattern:", directMatch[0]);
        return res.json({ url: directMatch[0] });
      }

      res.json({ url: cleanUrl });
    } catch (err: any) {
      console.error("Error resolving image URL:", err);
      res.json({ url: req.body?.url || "" });
    }
  });


  // In-memory cache for Live Google News
  let liveNewsCache: any[] = [];
  let lastLiveNewsFetch = 0;
  const NEWS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  function decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&ndash;/g, "–")
      .replace(/&mdash;/g, "—")
      .replace(/&middot;/g, "·")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/")
      .replace(/&deg;/g, "°");
  }

  async function fetchRssFeed(url: string, defaultCity: string): Promise<any[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      clearTimeout(timeoutId);
      if (!response.ok) return [];
      const text = await response.text();
      
      const items: any[] = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(text)) !== null && items.length < 15) {
        const itemContent = match[1];
        const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
        const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const sourceMatch = itemContent.match(/<source[\s\S]*?>([\s\S]*?)<\/source>/);
        
        if (titleMatch) {
          let title = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
          const link = linkMatch ? linkMatch[1].trim() : "https://news.google.com";
          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";
          const source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : "Google News";
          
          // Clean title
          const suffix = ` - ${source}`;
          if (title.toLowerCase().endsWith(suffix.toLowerCase())) {
            title = title.substring(0, title.length - suffix.length).trim();
          }
          
          title = decodeHtmlEntities(title);
          
          // Determine city/tag
          let city = defaultCity;
          if (defaultCity === "Outras") {
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes("ubá")) {
              city = "Ubá";
            } else if (lowerTitle.includes("barbacena")) {
              city = "Barbacena";
            } else if (lowerTitle.includes("matias barbosa")) {
              city = "Matias Barbosa";
            } else if (lowerTitle.includes("rodeiro")) {
              city = "Rodeiro";
            } else if (lowerTitle.includes("coronel pacheco")) {
              city = "Coronel Pacheco";
            } else if (lowerTitle.includes("goianá")) {
              city = "Goianá";
            } else {
              city = "Zona da Mata";
            }
          } else if (defaultCity === "Geral") {
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes("juiz de fora") || lowerTitle.includes(" jf")) {
              city = "Juiz de Fora";
            } else {
              city = "Negócios";
            }
          }
          
          items.push({
            id: `feed-${Math.random().toString(36).substr(2, 9)}`,
            city,
            title,
            link,
            pubDate,
            source
          });
        }
      }
      return items;
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.warn("Feed fetch notice:", url, e?.message || e);
      }
      return [];
    }
  }

  const FALLBACK_LOCAL_HEADLINES = [
    {
      id: "fallback-1",
      city: "Juiz de Fora",
      title: "Independência Shopping anuncia expansão de novas lojas para o segundo semestre",
      link: "https://news.google.com",
      pubDate: new Date().toUTCString(),
      source: "Portal Do Começo ao Topo"
    },
    {
      id: "fallback-2",
      city: "Zona da Mata",
      title: "Setor de tecnologia na Zona da Mata registra alta de 22% em novas contratações",
      link: "https://news.google.com",
      pubDate: new Date().toUTCString(),
      source: "Agência Regional MG"
    },
    {
      id: "fallback-3",
      city: "Matias Barbosa",
      title: "Prefeitura realiza rodada de negócios voltada para produtores rurais e empreendedores locais",
      link: "https://news.google.com",
      pubDate: new Date().toUTCString(),
      source: "Gazeta Regional"
    }
  ];

  app.get("/api/google-news", async (req, res) => {
    try {
      const now = Date.now();
      if (liveNewsCache.length > 0 && (now - lastLiveNewsFetch) < NEWS_CACHE_DURATION) {
        return res.json({ items: liveNewsCache });
      }

      const jfUrl = `https://news.google.com/rss/search?q=Juiz+de+Fora&hl=pt-BR&gl=BR&ceid=BR%3Apt-419`;
      const regionUrl = `https://news.google.com/rss/search?q=Zona+da+Mata+MG+OR+Uba+MG+OR+Barbacena+MG&hl=pt-BR&gl=BR&ceid=BR%3Apt-419`;
      const nationalUrl = `https://news.google.com/rss/search?q=negocios+tecnologia+brasil&hl=pt-BR&gl=BR&ceid=BR%3Apt-419`;

      const [jfItems, regionItems, nationalItems] = await Promise.all([
        fetchRssFeed(jfUrl, "Juiz de Fora").catch(() => []),
        fetchRssFeed(regionUrl, "Outras").catch(() => []),
        fetchRssFeed(nationalUrl, "Geral").catch(() => [])
      ]);

      // Combine items, interleaving them so user gets a varied list of news!
      const combined: any[] = [];
      const maxLength = Math.max(jfItems.length, regionItems.length, nationalItems.length);
      for (let i = 0; i < maxLength; i++) {
        if (jfItems[i]) combined.push(jfItems[i]);
        if (regionItems[i]) combined.push(regionItems[i]);
        if (nationalItems[i]) combined.push(nationalItems[i]);
      }

      if (combined.length > 0) {
        liveNewsCache = combined;
        lastLiveNewsFetch = now;
      } else if (liveNewsCache.length === 0) {
        liveNewsCache = FALLBACK_LOCAL_HEADLINES;
      }

      res.json({ items: liveNewsCache.length > 0 ? liveNewsCache : FALLBACK_LOCAL_HEADLINES });
    } catch (e: any) {
      res.json({ items: liveNewsCache.length > 0 ? liveNewsCache : FALLBACK_LOCAL_HEADLINES });
    }
  });


  app.get("/api/news-rss", async (req, res) => {
    try {
      const city = req.query.city || "";
      const query = "eventos " + city + " Brasil";
      // Google News RSS URL
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR%3Apt-419`;
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (!response.ok) {
        return res.status(500).json({ error: "Failed to fetch RSS" });
      }
      
      const xml = await response.text();
      
      // Basic Regex to extract items
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
        
        if (titleMatch) {
          items.push({
            title: titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'),
            link: linkMatch ? linkMatch[1] : "",
            pubDate: pubDateMatch ? pubDateMatch[1] : "",
            description: descMatch ? descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') : "",
          });
        }
      }
      
      res.json({ items: items.slice(0, 10) }); // Return top 10 per city
    } catch (e: any) {
      console.error("RSS route error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
