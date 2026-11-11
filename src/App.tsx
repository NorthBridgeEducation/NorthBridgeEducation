
import React, { useState } from "react";

type Education = {
  level: string;
  institution: string;
  group: string;
  result: string;
  year: string;
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "student@gmail.com",
    phone: "",
    dob: "",
    nationality: "Bangladeshi",
    passportNumber: "",
  });

  const [passport, setPassport] = useState<File | null>(null);

  const [education, setEducation] = useState<Education[]>([
    {
      level: "SSC",
      institution: "",
      group: "",
      result: "",
      year: "",
    },
    {
      level: "HSC",
      institution: "",
      group: "",
      result: "",
      year: "",
    },
  ]);

  const updateProfile = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updateEducation = (
    index: number,
    key: keyof Education,
    value: string
  ) => {
    setEducation((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  };

  const addEducation = () => {
    setEducation((prev) => [
      ...prev,
      {
        level: "Bachelor's",
        institution: "",
        group: "",
        result: "",
        year: "",
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #dce3ed",
    borderRadius: 9,
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
    background: "#fff",
    color: "#172033",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#344054",
    marginBottom: 7,
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder = "",
    type = "text"
  ) => (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      <input
        style={inputStyle}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: 9,
    background: "#1746a2",
    color: "white",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  };

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: 15,
    padding: 25,
    border: "1px solid #e7ebf2",
    boxShadow: "0 8px 30px rgba(16,35,70,.05)",
  };

  const headingStyle: React.CSSProperties = {
    color: "#172b4d",
    fontSize: 22,
    fontWeight: 800,
    margin: "0 0 8px",
  };

  // DEMO LOGIN SCREEN
  if (!loggedIn) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#071a38,#123d78,#1764a5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}>
        <div style={{
          ...cardStyle,
          width: "100%",
          maxWidth: 420,
          padding: "40px 32px",
          textAlign: "center",
        }}>
          <div style={{
            width: 58,
            height: 58,
            background: "#1746a2",
            color: "white",
            borderRadius: 15,
            display: "grid",
            placeItems: "center",
            fontSize: 25,
            fontWeight: 900,
            margin: "0 auto 18px",
          }}>
            N
          </div>

          <h1 style={{ color: "#15345f", margin: 0, fontSize: 27 }}>
            NorthBridge
          </h1>
          <p style={{ color: "#667085", marginTop: 8 }}>
            Student Application Portal
          </p>

          <div style={{
            background: "#eff6ff",
            borderRadius: 10,
            padding: 15,
            margin: "28px 0",
            color: "#315783",
            fontSize: 13,
            lineHeight: 1.6,
          }}>
            Welcome! Sign in to create your student profile
            and manage your application.
          </div>

          <button
            onClick={() => setLoggedIn(true)}
            style={{
              ...buttonStyle,
              background: "white",
              color: "#25344d",
              border: "1px solid #dce3ed",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 900, color: "#4285F4" }}>
              G
            </span>
            Continue with Google
          </button>

          <p style={{
            color: "#98a2b3",
            fontSize: 11,
            marginTop: 22,
          }}>
            DEMO MODE · Google authentication not connected
          </p>

          <p style={{ color: "#667085", fontSize: 12, marginTop: 28 }}>
            © 2026 NorthBridge Education
          </p>
        </div>
      </div>
    );
  }

  // MAIN PORTAL
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
        padding: "17px 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <strong style={{ fontSize: 21 }}>NorthBridge</strong>
          <div style={{ fontSize: 11, color: "#c4d5ed", marginTop: 4 }}>
            STUDENT APPLICATION PORTAL
          </div>
        </div>
        <div style={{ fontSize: 13 }}>
          {profile.email}
          <button
            onClick={() => {
              setLoggedIn(false);
              setStep(1);
            }}
            style={{
              marginLeft: 16,
              background: "#244875",
              color: "white",
              border: 0,
              padding: "9px 14px",
              borderRadius: 7,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{
        maxWidth: 1000,
        margin: "35px auto",
        padding: "0 18px",
      }}>
        <h1 style={headingStyle}>Student Profile</h1>
        <p style={{ color: "#667085", marginBottom: 28 }}>
          Complete your profile to proceed with your application.
        </p>

        <div style={{
          ...cardStyle,
          marginBottom: 22,
          padding: 18,
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}>
            {["Personal Info", "Passport", "Education"].map((item, i) => (
              <div
                key={item}
                onClick={() => setStep(i + 1)}
                style={{
                  flex: 1,
                  minWidth: 100,
                  textAlign: "center",
                  padding: 12,
                  borderRadius: 9,
                  background: step === i + 1 ? "#eaf1ff" : "#f8fafc",
                  color: step === i + 1 ? "#1746a2" : "#667085",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <div style={{ marginBottom: 5 }}>0{i + 1}</div>
                {item}
              </div>
            ))}
          </div>
        </div>

        {saved ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: 45 }}>
            <div style={{ fontSize: 48 }}>✓</div>
            <h2 style={{ color: "#16804a" }}>Profile Submitted!</h2>
            <p style={{ color: "#667085", lineHeight: 1.7 }}>
              Your demo student profile has been submitted successfully.
              This prototype does not yet save data to a server.
            </p>
            <button
              style={{ ...buttonStyle, maxWidth: 240, marginTop: 15 }}
              onClick={() => {
                setSaved(false);
                setStep(1);
              }}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <>
            {step === 1 && (
              <section style={cardStyle}>
                <h2 style={headingStyle}>Personal Information</h2>
                <p style={{ color: "#667085", fontSize: 13, marginBottom: 25 }}>
                  Enter your basic personal details.
                </p>

                {field("Full Name", profile.name, v => updateProfile("name", v), "Enter your full name")}
                {field("Email Address", profile.email, v => updateProfile("email", v), "Email address", "email")}
                {field("Phone Number", profile.phone, v => updateProfile("phone", v), "+8801XXXXXXXXX", "tel")}
                {field("Date of Birth", profile.dob, v => updateProfile("dob", v), "", "date")}
                {field("Nationality", profile.nationality, v => updateProfile("nationality", v), "Nationality")}
                {field("Passport Number", profile.passportNumber, v => updateProfile("passportNumber", v), "Enter passport number")}

                <button style={buttonStyle} onClick={() => setStep(2)}>
                  Save & Continue →
                </button>
              </section>
            )}

            {step === 2 && (
              <section style={cardStyle}>
                <h2 style={headingStyle}>Passport Information</h2>
                <p style={{ color: "#667085", fontSize: 13, marginBottom: 25 }}>
                  Upload a clear copy of your passport.
                </p>

                <div style={{
                  border: "2px dashed #b9c9df",
                  background: "#f8fbff",
                  borderRadius: 12,
                  padding: 35,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 42 }}>📄</div>
                  <h3 style={{ color: "#253d61" }}>Upload Passport</h3>
                  <p style={{ color: "#667085", fontSize: 13 }}>
                    PDF, JPG or PNG files
                  </p>
                  <label style={{
                    display: "inline-block",
                    background: "#1746a2",
                    color: "white",
                    padding: "12px 20px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                  }}>
                    Choose File
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: "none" }}
                      onChange={e => setPassport(e.target.files?.[0] || null)}
                    />
                  </label>
                  {passport && (
                    <p style={{ color: "#16804a", fontSize: 13, marginTop: 15 }}>
                      ✓ {passport.name}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 25 }}>
                  <button
                    style={{ ...buttonStyle, background: "#e9eef5", color: "#344054" }}
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button style={buttonStyle} onClick={() => setStep(3)}>
                    Save & Continue →
                  </button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section style={cardStyle}>
                <h2 style={headingStyle}>Educational History</h2>
                <p style={{ color: "#667085", fontSize: 13, marginBottom: 25 }}>
                  Add your academic qualifications.
                </p>

                {education.map((edu, index) => (
                  <div key={index} style={{
                    background: "#f8fafc",
                    border: "1px solid #e5eaf1",
                    padding: 18,
                    borderRadius: 11,
                    marginBottom: 18,
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}>
                      <strong style={{ color: "#1746a2" }}>
                        Education #{index + 1}
                      </strong>
                      {education.length > 1 && (
                        <button
                          onClick={() => removeEducation(index)}
                          style={{
                            border: 0,
                            background: "#feecec",
                            color: "#c0392b",
                            padding: "7px 10px",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                      gap: 12,
                    }}>
                      <div>
                        <label style={labelStyle}>Qualification</label>
                        <select
                          style={inputStyle}
                          value={edu.level}
                          onChange={e => updateEducation(index, "level", e.target.value)}
                        >
                          <option>SSC</option>
                          <option>HSC</option>
                          <option>Diploma</option>
                          <option>Bachelor's</option>
                          <option>Master's</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div>
                        <label style={labelStyle}>Institution Name</label>
                        <input
                          style={inputStyle}
                          placeholder="School / College / University"
                          value={edu.institution}
                          onChange={e => updateEducation(index, "institution", e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Group / Subject</label>
                        <input
                          style={inputStyle}
                          placeholder="Science / Business / Arts"
                          value={edu.group}
                          onChange={e => updateEducation(index, "group", e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Result / CGPA</label>
                        <input
                          style={inputStyle}
                          placeholder="e.g. GPA 5.00"
                          value={edu.result}
                          onChange={e => updateEducation(index, "result", e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Passing Year</label>
                        <input
                          style={inputStyle}
                          placeholder="e.g. 2024"
                          value={edu.year}
                          onChange={e => updateEducation(index, "year", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addEducation}
                  style={{
                    width: "100%",
                    padding: 13,
                    background: "#eff5ff",
                    border: "1px dashed #8da9d2",
                    borderRadius: 9,
                    color: "#1746a2",
                    fontWeight: 700,
                    cursor: "pointer",
                    marginBottom: 22,
                  }}
                >
                  + Add Another Qualification
                </button>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    style={{ ...buttonStyle, background: "#e9eef5", color: "#344054" }}
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                  <button style={buttonStyle} onClick={() => setSaved(true)}>
                    Submit Profile ✓
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        <p style={{
          textAlign: "center",
          fontSize: 12,
          color: "#98a2b3",
          marginTop: 25,
        }}>
          NorthBridge Education · Student Portal Prototype
        </p>
      </main>
    </div>
  );
}
