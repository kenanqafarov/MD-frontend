import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#EEF2F6", padding: "24px", fontFamily: "Open Sans, sans-serif" }}>
      <div style={{ background: "white", padding: "32px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center", maxWidth: "420px" }}>
        <h1 style={{ marginBottom: "12px", color: "#1F2937" }}>404 - Səhifə tapılmadı</h1>
        <p style={{ marginBottom: "20px", color: "#6B7280" }}>Axtardığınız səhifə mövcud deyil.</p>
        <Link to="/" style={{ color: "#155EEF", fontWeight: "600", textDecoration: "none" }}>Ana səhifəyə qayıt</Link>
      </div>
    </div>
  );
}

export default NotFound;
