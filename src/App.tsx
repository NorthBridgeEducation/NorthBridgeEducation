
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";

type Education = {
  id?: string;
  qualification: string;
  institution: string;
  subject: string;
  result: string;
  passing_year: string;
};

const emptyEducation: Education = {
  qualification: "SSC",
  institution: "",
  subject: "",
  result: "",
  passing_year: "",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  border: "1px solid #dce3ed",
  borderRadius: 8,
  fontSize: 14,
  boxSizing: "border-box",
  marginTop: 6,
};

const buttonStyle: React.CSSProperties = {
  padding: "13px 18px",
  background: "#1746a2",
  color: "white",
  border: 0,
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    nationality: "Bangladeshi",
    passport_number: "",
    passport_path: "",
  });

  const [education, setEducation] = useState<Education[]>([
    { ...emptyEducation },
    { ...emptyEducation, qualification: "HSC" },
  ]);

  const [passport, setPassport] = useState<File | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setMessage(error.message);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadData() {
      const { data: p, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        setMessage(profileError.message);
        return;
      }

      if (p) {
        setProfile({
          full_name: p.full_name ?? "",
          email: p.email ?? user!.email ?? "",
          phone: p.phone ?? "",
          date_of_birth: p.date_of_birth ?? "",
          nationality: p.nationality ?? "Bangladeshi",
          passport_number: p.passport_number ?? "",
          passport_path: p.passport_path ?? "",
        });
      } else {
        setProfile((old) => ({
          ...old,
          email: user!.email ?? "",
          full_name:
            user!.user_metadata?.full_name ??
            user!.user_metadata?.name ??
            "",
        }));
      }

      const { data: records, error: educationError } = await supabase
        .from("education_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at");

      if (cancelled) return;

      if (educationError) {
        setMessage(educationError.message);
        return;
      }

      if (records?.length) {
        setEducation(
          records.map((record) => ({
            id: record.id,
            qualification: record.qualification,
            institution: record.institution ?? "",
            subject: record.subject ?? "",
            result: record.result ?? "",
            passing_year: record.passing_year ?? "",
          }))
        );
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const updateProfile = (key: string, value: string) => {
    setProfile((old) => ({ ...old, [key]: value }));
  };

  const loginWithGoogle = async () => {
    setBusy(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setMessage(error.message);
  };

  const saveProfile = async () => {
    if (!user) return;

    setBusy(true);
    setMessage("");

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...profile,
      email: user.email ?? profile.email,
      updated_at: new Date().toISOString(),
    });

    setBusy(false);
    setMessage(error ? error.message : "Profile saved successfully!");
  };

  const uploadPassport = async () => {
    if (!user || !passport) {
      setMessage("Please choose a passport file first.");
      return;
    }

    const allowed = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowed.includes(passport.type)) {
      setMessage("Only PDF, JPG and PNG files are allowed.");
      return;
    }

    if (passport.size > 5 * 1024 * 1024) {
      setMessage("File size must be 5 MB or less.");
      return;
    }

    setBusy(true);
    setMessage("");

    const extension = passport.name.split(".").pop()?.toLowerCase() || "pdf";
    const path = `${user.id}/passport.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("passport-documents")
      .upload(path, passport, {
        upsert: true,
        contentType: passport.type,
      });

    if (uploadError) {
      setBusy(false);
      setMessage(uploadError.message);
      return;
    }

    const { error: saveError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        ...profile,
        email: user.email ?? profile.email,
        passport_path: path,
        updated_at: new Date().toISOString(),
      });

    if (saveError) {
      setBusy(false);
      setMessage(saveError.message);
      return;
    }

    setProfile((old) => ({ ...old, passport_path: path }));
    setPassport(null);
    setBusy(false);
    setMessage("Passport uploaded securely!");
  };

  const saveEducation = async () => {
    if (!user) return;

    setBusy(true);
    setMessage("");

    const valid = education.filter(
      (item) => item.qualification.trim() && item.institution.trim()
    );

    const { error: deleteError } = await supabase
      .from("education_history")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      setBusy(false);
      setMessage(deleteError.message);
      return;
    }

    if (valid.length) {
      const rows = valid.map((item) => ({
        user_id: user.id,
        qualification: item.qualification,
        institution: item.institution,
        subject: item.subject,
        result: item.result,
        passing_year: item.passing_year,
      }));

      const { error } = await supabase
        .from("education_history")
        .insert(rows);

      if (error) {
        setBusy(false);
        setMessage(error.message);
        return;
      }
    }

    setBusy(false);
    setMessage("Educational history saved successfully!");
  };

  const addEducation = () => {
    setEducation((old) => [...old, { ...emptyEducation }]);
  };

  const updateEducation = (
    index: number,
    key: keyof Education,
    value: string
  ) => {
    setEducation((old) =>
      old.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        Loading NorthBridge Portal...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "linear-gradient(135deg,#071a38,#1764a5)",
        fontFamily: "Arial",
      }}>
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: 40,
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
          boxSizing: "border-box",
        }}>
          <h1 style={{ color: "#15345f" }}>NorthBridge</h1>
          <p style={{ color: "#667085" }}>
            Student Application Portal
          </p>

          <button
            style={{
              ...buttonStyle,
              width: "100%",
              marginTop: 25,
              background: "white",
              color: "#25344d",
              border: "1px solid #dce3ed",
            }}
            onClick={loginWithGoogle}
            disabled={busy}
          >
            {busy ? "Connecting..." : "🌐 Continue with Google"}
          </button>

          {message && (
            <p style={{ color: "#c0392b", fontSize: 13 }}>{message}</p>
          )}
        </div>
      </div>
    );
  }

  const field = (
    label: string,
    key: keyof typeof profile,
    type = "text"
  ) => (
    <label style={{
      display: "block",
      marginBottom: 16,
      fontSize: 13,
      fontWeight: 600,
      color: "#344054",
    }}>
      {label}
      <input
        style={inputStyle}
        type={type}
        value={profile[key]}
        onChange={(e) => updateProfile(key, e.target.value)}
      />
    </label>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f7fb",
      fontFamily: "Arial, sans-serif",
      color: "#172033",
    }}>
      <header style={{
        background: "#102e59",
        color: "white",
        padding: "18px 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <strong style={{ fontSize: 22 }}>NorthBridge</strong>
        <div>
          <span style={{ fontSize: 13 }}>{user.email}</span>
          <button
            onClick={logout}
            style={{
              marginLeft: 15,
              padding: "9px 14px",
              border: 0,
              borderRadius: 7,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{
        maxWidth: 900,
        margin: "35px auto",
        padding: "0 18px",
      }}>
        <h1>Student Profile</h1>
        <p style={{ color: "#667085" }}>
          Complete your personal and academic information.
        </p>

        {message && (
          <div style={{
            background: "#eaf3ff",
            padding: 13,
            borderRadius: 8,
            margin: "18px 0",
            color: "#1746a2",
          }}>
            {message}
          </div>
        )}

        <section style={{
          background: "white",
          padding: 24,
          borderRadius: 14,
          marginTop: 22,
          border: "1px solid #e5eaf1",
        }}>
          <h2>Personal Information</h2>
          {field("Full Name", "full_name")}
          {field("Email Address", "email")}
          {field("Phone Number", "phone", "tel")}
          {field("Date of Birth", "date_of_birth", "date")}
          {field("Nationality", "nationality")}
          {field("Passport Number", "passport_number")}

          <button
            style={buttonStyle}
            onClick={saveProfile}
            disabled={busy}
          >
            Save Profile
          </button>
        </section>

        <section style={{
          background: "white",
          padding: 24,
          borderRadius: 14,
          marginTop: 22,
          border: "1px solid #e5eaf1",
        }}>
          <h2>Passport Documhent</h2>
          <p style={{ color: "#667085", fontSize: 13 }}>
            PDF, JPG or PNG · Maximum 5 MB · Private storage
          </p>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setPassport(e.target.files?.[0] ?? null)}
          />

          <div style={{ marginTop: 16 }}>
            <button
              style={buttonStyle}
              onClick={uploadPassport}
              disabled={busy || !passport}
            >
              Upload Passport
            </button>
          </div>

          {profile.passport_path && (
            <p style={{ color: "#16804a", fontSize: 13 }}>
              ✓ Passport uploaded
            </p>
          )}
        </section>

        <section style={{
          background: "white",
          padding: 24,
          borderRadius: 14,
          marginTop: 22,
          border: "1px solid #e5eaf1",
        }}>
          <h2>Educational History</h2>

          {education.map((item, index) => (
            <div key={index} style={{
              padding: 17,
              background: "#f8fafc",
              borderRadius: 10,
              marginBottom: 16,
            }}>
              <h3>Qualification {index + 1}</h3>

              <label style={{ fontSize: 13 }}>
                Qualification
                <select
                  style={inputStyle}
                  value={item.qualification}
                  onChange={(e) =>
                    updateEducation(index, "qualification", e.target.value)
                  }
                >
                  {["SSC", "HSC", "Diploma", "Bachelor's", "Master's", "Other"].map(
                    (level) => <option key={level}>{level}</option>
                  )}
                </select>
              </label>

              {(
                [
                  ["Institution", "institution"],
                  ["Subject / Group", "subject"],
                  ["Result / CGPA", "result"],
                  ["Passing Year", "passing_year"],
                ] as const
              ).map(([label, key]) => (
                <label key={key} style={{
                  display: "block",
                  marginTop: 13,
                  fontSize: 13,
                  fontWeight: 600,
                }}>
                  {label}
                  <input
                    style={inputStyle}
                    value={item[key]}
                    onChange={(e) =>
                      updateEducation(index, key, e.target.value)
                    }
                  />
                </label>
              ))}

              <button
                onClick={() =>
                  setEducation((old) => old.filter((_, i) => i !== index))
                }
                style={{
                  marginTop: 12,
                  border: 0,
                  background: "#feecec",
                  color: "#b42318",
                  padding: 9,
                  borderRadius: 7,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={addEducation}
            style={{
              ...buttonStyle,
              background: "#eaf1ff",
              color: "#1746a2",
              marginRight: 10,
            }}
          >
            + Add Qualification
          </button>

          <button
            style={{ ...buttonStyle, marginTop: 15 }}
            onClick={saveEducation}
            disabled={busy}
          >
            Save Educational History
          </button>
        </section>

        <p style={{
          textAlign: "center",
          color: "#98a2b3",
          fontSize: 12,
          margin: 30,
        }}>
          © 2025 NorthBridge Education
        </p>
      </main>
    </div>
  );
}
