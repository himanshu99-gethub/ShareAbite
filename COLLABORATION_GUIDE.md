# 👥 ShareAbite - Team Collaboration & Git Guide

Yeh guide dono team members ke liye hai taaki ek hi project par bina kisi code conflict ya overwrite ke seamlessly kaam kiya ja sake.

---

## 📌 Repository Details
- **Repo URL**: `https://github.com/himanshu99-gethub/ShareAbite.git`
- **Main Branch**: `main`

---

## 🛠️ Step 1: Dusre Member ke liye (First Time Setup / Clone)

Agar dusre teammate ne abhi tak project laptop me download nahi kiya hai:

```bash
# 1. Project clone karein
git clone https://github.com/himanshu99-gethub/ShareAbite.git

# 2. Project folder me jayein
cd ShareAbite

# 3. Dependencies install karein
npm install
# ya agar bun use kar rahe hain:
# bun install

# 4. .env file setup karein (.env.example ko copy karke .env banayein)
cp .env.example .env
```

---

## 🔄 Step 2: Daily Workflow (Har Din Kaam Shuru Karne Se Pehle)

> **IMPORTANT RULE #1:** Kaam shuru karne se pehle **HAMESHA** latest code pull karein taaki doosre member ke changes aapke paas aa jayein.

```bash
# Latest changes download karein:
git pull origin main
```

---

## 🚀 Step 3: Kaam Karne Ke Baad Code Push Karna

### Option A: Feature Branch Workflow (Recommended - Safe & Professional)

Isse conflict nahi hota aur code safe rehta hai.

1. **Apni new branch banayein:**
   ```bash
   git checkout -b feature/<aapka-feature-name>
   # Example: git checkout -b feature/auth-fix
   ```

2. **Apne changes check karein:**
   ```bash
   git status
   ```

3. **Changes add aur commit karein:**
   ```bash
   git add .
   git commit -m "feat: added login validation"
   ```

4. **GitHub par apni branch push karein:**
   ```bash
   git push -u origin feature/<aapka-feature-name>
   ```

5. **GitHub par jaakar Pull Request (PR) create karke merge karein:**
   - GitHub repo open karein
   - **"Compare & pull request"** button par click karein
   - **"Merge pull request"** karein

---

### Option B: Direct Main Branch Workflow (Small Changes Ke Liye)

Agar dono log direct `main` par push kar rahe hain:

1. **Pehle pull karein:**
   ```bash
   git pull origin main
   ```

2. **Files add karein:**
   ```bash
   git add .
   ```

3. **Commit message likhein:**
   ```bash
   git commit -m "Describe your changes clearly"
   ```

4. **GitHub par push karein:**
   ```bash
   git push origin main
   ```

---

## ⚠️ Step 4: Agar "Merge Conflict" Ya Error Aaye Toh Kya Karein?

Agar dono ne ek hi file ki same line modify kardi aur push reject ho gaya:

1. **Pull karein:**
   ```bash
   git pull origin main
   ```

2. **VS Code me conflict solve karein:**
   - VS Code me file me `<<<<<<< HEAD`, `=======`, `>>>>>>>` dikhega.
   - Upar buttons dikhenge: **"Accept Current Change"**, **"Accept Incoming Change"**, ya **"Accept Both Changes"**.
   - Sahi option select karein aur file save karein.

3. **Fir dobara push karein:**
   ```bash
   git add .
   git commit -m "fix: resolve merge conflicts"
   git push origin main
   ```

---

## 🔐 Crucial Rules (Dhyaan Rakhne Wali Baatein)

| Rule | Description |
|------|-------------|
| ❌ **Never Commit `.env`** | `.env` me secret keys hoti hain. `.gitignore` me `.env` already added hai, use kabhi force add na karein. |
| 🔄 **Pull Before Push** | Push karne se pehle hamesha `git pull` karein. |
| 🌿 **Keep Commits Clear** | Commit message me saaf likhein ki kya change kiya (e.g. `feat: added map markers`). |
