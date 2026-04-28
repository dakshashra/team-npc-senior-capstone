import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      style={{
        background: "#ededed",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "32px",
        marginTop: "auto",
      }}
    >
      {/* Lab name */}
      <h2
        style={{
          fontFamily: "'NeuePlakBlack', Inter, sans-serif",
          fontSize: "24px",
          fontWeight: 800,
          marginBottom: "20px",
          color: "#000000",
        }}
      >
        Machine Learning &amp; Data Science Lab
      </h2>

      {/* Email */}
      <div style={{ marginBottom: "20px" }}>
        <span
          style={{
            display: "block",
            fontFamily: "'NeuePlakBlack', Inter, sans-serif",
            fontWeight: 800,
            fontSize: "14px",
            textTransform: "uppercase",
            marginBottom: "5px",
            letterSpacing: "1px",
          }}
        >
          Email
        </span>
        <p style={{ fontSize: "16px", color: "#333333", lineHeight: 1.5 }}>
          <a
            href="mailto:victor.sheng@ttu.edu"
            style={{ color: "#000000", textDecoration: "underline" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#d60000";
              e.currentTarget.style.textDecoration = "none";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#000000";
              e.currentTarget.style.textDecoration = "underline";
            }}
          >
            victor.sheng@ttu.edu
          </a>
        </p>
      </div>

      {/* Phone */}
      <div style={{ marginBottom: "20px" }}>
        <span
          style={{
            display: "block",
            fontFamily: "'NeuePlakBlack', Inter, sans-serif",
            fontWeight: 800,
            fontSize: "14px",
            textTransform: "uppercase",
            marginBottom: "5px",
            letterSpacing: "1px",
          }}
        >
          Phone
        </span>
        <p style={{ fontSize: "16px", color: "#333333", lineHeight: 1.5 }}>
          <a
            href="tel:8068348971"
            style={{ color: "#000000", textDecoration: "underline" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#d60000";
              e.currentTarget.style.textDecoration = "none";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#000000";
              e.currentTarget.style.textDecoration = "underline";
            }}
          >
            806.834.8971
          </a>
        </p>
      </div>

      {/* Address */}
      <div style={{ marginBottom: "20px" }}>
        <span
          style={{
            display: "block",
            fontFamily: "'NeuePlakBlack', Inter, sans-serif",
            fontWeight: 800,
            fontSize: "14px",
            textTransform: "uppercase",
            marginBottom: "5px",
            letterSpacing: "1px",
          }}
        >
          Address
        </span>
        <p style={{ fontSize: "16px", color: "#333333", lineHeight: 1.5 }}>
          EC 314, Texas Tech University<br />
          Department of Computer Science<br />
          Box 43104, Lubbock, TX 79409‑3104
        </p>
      </div>

      {/* Logo — click to go to admin */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: "10px",
        }}
      >
        <Link href="/admin">
          <Image
            src="/footerpic.png"
            alt="TTU Department of Computer Science"
            width={300}
            height={100}
            style={{ maxWidth: "300px", height: "auto", display: "block" }}
          />
        </Link>
      </div>
    </footer>
  );
}
