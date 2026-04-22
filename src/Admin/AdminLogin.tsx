// import React, { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../Login.css";

// import { useProject } from "../Context/projectContext"; // ✅ adjust path
// import { adminLogin } from "../Api/Admin/adminLogin"; // ✅ your API function
// import { PopupAlert } from "../Components/alert"; // ✅ if you want popup

// type Props = {
//     onForgotPassword?: () => void;
// };

// export default function AdminLogin({ onForgotPassword }: Props) {
//     const { loginAdmin } = useProject(); // ✅ from ProjectContext
//     const navigate = useNavigate();

//     const [tried, setTried] = useState(false);
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [remember, setRemember] = useState(false);

//     const [showPass, setShowPass] = useState(false);
//     const year = useMemo(() => new Date().getFullYear(), []);

//     const usernameErr = tried && username.trim().length < 3;
//     const passErr = tried && password.trim().length < 6;

//     const [loading, setLoading] = useState(false);

//     // ✅ popup optional
//     const [popupOpen, setPopupOpen] = useState(false);
//     const [popupType, setPopupType] = useState<"success" | "danger">("success");
//     const [popupMessage, setPopupMessage] = useState("");

//     const onSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setTried(true);

//         if (username.trim().length < 3) return;
//         if (password.trim().length < 6) return;

//         try {
//             setLoading(true);

//             // ✅ call API
//             const data = await adminLogin({
//                 UserName: username.trim(),
//                 Password: password,
//             });

//             // ✅ save to ProjectContext + localStorage
//             loginAdmin(data);

//             setPopupType("success");
//             setPopupMessage("Login successful! Redirecting...");
//             setPopupOpen(true);

//             setTimeout(() => {
//                 navigate("/admin/dashboard"); // ✅ change route
//             }, 1200);
//         } catch (err: any) {
//             setPopupType("danger");
//             setPopupMessage(err?.message || "Login failed");
//             setPopupOpen(true);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const onReset = () => {
//         setTried(false);
//         setUsername("");
//         setPassword("");
//         setRemember(false);
//         setShowPass(false);
//     };

//     return (
//         <>
//             <div className="wrap">
//                 <div className="glass">
//                     <div className="row g-0">
//                         <aside className="col-12 col-lg-5 side p-4 p-md-5">
//                             <div className="d-flex align-items-center gap-3 mb-4 position-relative" style={{ zIndex: 1 }}>
//                                 <div className="brand">NJ</div>
//                                 <div className="lh-sm">
//                                     <div className="fw-bold">NJ Softtech</div>
//                                     <div className="text-secondary small">Admin Portal</div>
//                                 </div>
//                             </div>

//                             <div className="position-relative" style={{ zIndex: 1 }}>
//                                 <div className="text-uppercase fw-semibold small text-secondary">Secure Access</div>
//                                 <h1 className="display-6 fw-bold mb-2">Admin Login</h1>
//                                 <p className="text-secondary mb-4">
//                                     Sign in to manage registrations, view submissions, and export data.
//                                 </p>

//                                 <div className="d-flex flex-wrap gap-2 mb-4">
//                                     <span className="pill"><i className="bi bi-shield-check" /> Protected</span>
//                                     <span className="pill"><i className="bi bi-person-lock" /> Admin only</span>
//                                     <span className="pill"><i className="bi bi-clock-history" /> Activity logs</span>
//                                 </div>

//                                 <div className="divider" />
//                                 <div className="mini-note">If you don’t have access, contact the system administrator.</div>
//                             </div>
//                         </aside>

//                         <section className="col-12 col-lg-7 p-4 p-md-5">
//                             <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
//                                 <div>
//                                     <div className="fw-bold fs-4">Welcome back</div>
//                                     <div className="text-secondary">Enter your admin credentials to continue.</div>
//                                 </div>
//                                 <span className="badge rounded-pill text-bg-secondary align-self-start">Admin</span>
//                             </div>

//                             <form
//                                 id="adminLoginForm"
//                                 className={`needs-validation ${tried ? "was-validated" : ""}`}
//                                 noValidate
//                                 onSubmit={onSubmit}
//                                 onReset={onReset}
//                             >
//                                 <div className="row g-3">
//                                     <div className="col-12">
//                                         <label className="form-label fw-semibold">
//                                             Username <span className="req">*</span>
//                                         </label>

//                                         <div className="input-group has-validation">
//                                             <span className="input-group-text" style={{ borderRadius: "14px 0 0 14px", borderColor: "var(--stroke)" }}>
//                                                 <i className="bi bi-person" />
//                                             </span>

//                                             <input
//                                                 id="adminUser"
//                                                 className={`form-control ${usernameErr ? "is-invalid" : ""}`}
//                                                 required
//                                                 minLength={3}
//                                                 placeholder="admin@njsofttech.com"
//                                                 style={{ borderRadius: "0 14px 14px 0" }}
//                                                 value={username}
//                                                 onChange={(e) => setUsername(e.target.value)}
//                                             />

//                                             <div className="invalid-feedback">Please enter your username/email.</div>
//                                         </div>
//                                     </div>

//                                     <div className="col-12">
//                                         <label className="form-label fw-semibold">
//                                             Password <span className="req">*</span>
//                                         </label>

//                                         <div className="input-group has-validation">
//                                             <span className="input-group-text" style={{ borderRadius: "14px 0 0 14px", borderColor: "var(--stroke)" }}>
//                                                 <i className="bi bi-key" />
//                                             </span>

//                                             <input
//                                                 id="adminPass"
//                                                 type={showPass ? "text" : "password"}
//                                                 className={`form-control ${passErr ? "is-invalid" : ""}`}
//                                                 required
//                                                 minLength={6}
//                                                 placeholder="Enter password"
//                                                 style={{ borderRadius: 0 }}
//                                                 value={password}
//                                                 onChange={(e) => setPassword(e.target.value)}
//                                             />

//                                             <button
//                                                 id="togglePass"
//                                                 className="btn btn-outline-secondary icon-btn"
//                                                 type="button"
//                                                 aria-label={showPass ? "Hide password" : "Show password"}
//                                                 onClick={() => setShowPass((v) => !v)}
//                                             >
//                                                 <i className={showPass ? "bi bi-eye-slash" : "bi bi-eye"} />
//                                             </button>

//                                             <div className="invalid-feedback">Please enter your password.</div>
//                                         </div>

//                                         <div className="mini-note mt-1">Minimum 6 characters.</div>
//                                     </div>

//                                     <div className="col-12">
//                                         <div
//                                             className="border rounded-4 p-3"
//                                             style={{
//                                                 borderColor: "var(--stroke)",
//                                                 background:  "color-mix(in oklab, #0e1629 92%, transparent 8%)"  
//                                             }}
//                                         >
//                                             <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center">
//                                                 <div className="form-check m-0">
//                                                     <input
//                                                         className="form-check-input"
//                                                         type="checkbox"
//                                                         id="remember"
//                                                         checked={remember}
//                                                         onChange={(e) => setRemember(e.target.checked)}
//                                                     />
//                                                     <label className="form-check-label fw-semibold" htmlFor="remember">
//                                                         Remember me
//                                                     </label>
//                                                     <div className="mini-note mt-1">Don’t use on public devices.</div>
//                                                 </div>

//                                                 <button
//                                                     type="button"
//                                                     className="btn btn-link link-secondary text-decoration-none small p-0"
//                                                     onClick={onForgotPassword}
//                                                 >
//                                                     <i className="bi bi-question-circle" /> Forgot password?
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div className="col-12 d-flex flex-wrap gap-2 justify-content-between align-items-center pt-2">
//                                         <div className="mini-note">
//                                             <i className="bi bi-lock" /> Encrypted session.
//                                         </div>

//                                         <div className="d-flex gap-2">
//                                             <button type="reset" className="btn btn-outline-secondary" style={{ borderRadius: 14 }}>
//                                                 Reset
//                                             </button>

//                                             <button type="submit" className="btn btn-brand px-4" disabled={loading}>
//                                                 {loading ? "Logging in..." : <>Login <i className="bi bi-arrow-right ms-2" /></>}
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </form>

//                             <div className="mini-note mt-4">© {year} NJ Softtech • Admin Portal</div>
//                         </section>
//                     </div>
//                 </div>
//             </div>

//             <PopupAlert
//                 open={popupOpen}
//                 type={popupType}
//                 title={popupType === "success" ? "Success" : "Login Failed"}
//                 message={popupMessage}
//                 autoCloseMs={2000}
//                 onClose={() => setPopupOpen(false)}
//             />
//         </>
//     );
// }


// src/Admin/AdminLogin.tsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Login.css";

import { useProject } from "../Context/projectContext";
import { adminLogin } from "../Api/Admin/adminLogin";
import { PopupAlert } from "../Components/alert";

type Props = {
    onForgotPassword?: () => void;
};

export default function AdminLogin({ onForgotPassword }: Props) {
    const { loginAdmin } = useProject();
    const navigate = useNavigate();

    const [tried,    setTried]    = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [orgCode,  setOrgCode]  = useState(""); // ✅ NEW — OrgCode field
    const [remember, setRemember] = useState(false);

    const [showPass, setShowPass] = useState(false);
    const year = useMemo(() => new Date().getFullYear(), []);

    // ─── Validation flags ───────────────────────────────────────────
    const usernameErr = tried && username.trim().length < 3;
    const passErr     = tried && password.trim().length < 6;
    const orgCodeErr  = tried && orgCode.trim().length === 0; // ✅ required

    const [loading, setLoading] = useState(false);

    const [popupOpen,    setPopupOpen]    = useState(false);
    const [popupType,    setPopupType]    = useState<"success" | "danger">("success");
    const [popupMessage, setPopupMessage] = useState("");

    // ─── Submit ──────────────────────────────────────────────────────
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTried(true);

        // ✅ Guard all three fields
        if (username.trim().length < 3) return;
        if (password.trim().length < 6) return;
        if (!orgCode.trim())            return;

        try {
            setLoading(true);

            // ✅ Pass OrgCode — the API uses it as X-ADMIN-CODE to scope login
            const data = await adminLogin({
                UserName: username.trim(),
                Password: password,
                OrgCode:  orgCode.trim(),
            });

            // ✅ Persist to ProjectContext + localStorage
            loginAdmin(data);

            // AFTER loginAdmin(data);

            // localStorage.setItem("ORGCODE", orgCode);

            // // ✅ ADD THIS LINE (CRITICAL FIX)
            // localStorage.setItem("ORGNAME", data.orgName || "");

            setPopupType("success");
            setPopupMessage("Login successful! Redirecting...");
            setPopupOpen(true);

            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 1200);

        } catch (err: any) {
            setPopupType("danger");
            setPopupMessage(err?.message || "Login failed");
            setPopupOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const onReset = () => {
        setTried(false);
        setUsername("");
        setPassword("");
        setOrgCode("");
        setRemember(false);
        setShowPass(false);
    };

    return (
        <>
            <div className="wrap">
                <div className="glass">
                    <div className="row g-0">

                        {/* ── Left info panel ──────────────────────────────── */}
                        <aside className="col-12 col-lg-5 side p-4 p-md-5">
                            <div className="d-flex align-items-center gap-3 mb-4 position-relative" style={{ zIndex: 1 }}>
                                <div className="brand">NJ</div>
                                <div className="lh-sm">
                                    <div className="fw-bold">NJ Softtech</div>
                                    <div className="text-secondary small">Admin Portal</div>
                                </div>
                            </div>

                            <div className="position-relative" style={{ zIndex: 1 }}>
                                <div className="text-uppercase fw-semibold small text-secondary">Secure Access</div>
                                <h1 className="display-6 fw-bold mb-2">Admin Login</h1>
                                <p className="text-secondary mb-4">
                                    Sign in to manage registrations, view submissions, and export data.
                                </p>

                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    <span className="pill"><i className="bi bi-shield-check" /> Protected</span>
                                    <span className="pill"><i className="bi bi-person-lock" /> Admin only</span>
                                    <span className="pill"><i className="bi bi-clock-history" /> Activity logs</span>
                                </div>

                                <div className="divider" />
                                <div className="mini-note">
                                    Use the credentials provided by your service provider. <br />
                                    Your <strong>Organization Code</strong> is included with your credentials.
                                </div>
                            </div>
                        </aside>

                        {/* ── Right login panel ────────────────────────────── */}
                        <section className="col-12 col-lg-7 p-4 p-md-5">
                            <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                                <div>
                                    <div className="fw-bold fs-4">Welcome back</div>
                                    <div className="text-secondary">Enter your admin credentials to continue.</div>
                                </div>
                                <span className="badge rounded-pill text-bg-secondary align-self-start">Admin</span>
                            </div>

                            <form
                                id="adminLoginForm"
                                className={`needs-validation ${tried ? "was-validated" : ""}`}
                                noValidate
                                onSubmit={onSubmit}
                                onReset={onReset}
                            >
                                <div className="row g-3">

                                    {/* ── Organization Code ─────────────────────────── */}
                                    {/* ✅ NEW FIELD — required to scope login to correct org */}
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">
                                            Organization Code <span className="req">*</span>
                                        </label>

                                        <div className="input-group has-validation">
                                            <span
                                                className="input-group-text"
                                                style={{ borderRadius: "14px 0 0 14px", borderColor: "var(--stroke)" }}
                                            >
                                                <i className="bi bi-building" />
                                            </span>

                                            <input
                                                id="orgCode"
                                                className={`form-control ${orgCodeErr ? "is-invalid" : ""}`}
                                                required
                                                placeholder="Enter your Organization Code"
                                                style={{ borderRadius: "0 14px 14px 0" }}
                                                value={orgCode}
                                                onChange={(e) => setOrgCode(e.target.value)}
                                            />

                                            <div className="invalid-feedback">
                                                Please enter your Organization Code.
                                            </div>
                                        </div>

                                        <div className="mini-note mt-1">
                                            Provided by your service provider (e.g. NJ Softtech).
                                        </div>
                                    </div>

                                    {/* ── Username ──────────────────────────────────── */}
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">
                                            Username <span className="req">*</span>
                                        </label>

                                        <div className="input-group has-validation">
                                            <span
                                                className="input-group-text"
                                                style={{ borderRadius: "14px 0 0 14px", borderColor: "var(--stroke)" }}
                                            >
                                                <i className="bi bi-person" />
                                            </span>

                                            <input
                                                id="adminUser"
                                                className={`form-control ${usernameErr ? "is-invalid" : ""}`}
                                                required
                                                minLength={3}
                                                placeholder="Enter your username"
                                                style={{ borderRadius: "0 14px 14px 0" }}
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                            />

                                            <div className="invalid-feedback">Please enter your username.</div>
                                        </div>
                                    </div>

                                    {/* ── Password ──────────────────────────────────── */}
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">
                                            Password <span className="req">*</span>
                                        </label>

                                        <div className="input-group has-validation">
                                            <span
                                                className="input-group-text"
                                                style={{ borderRadius: "14px 0 0 14px", borderColor: "var(--stroke)" }}
                                            >
                                                <i className="bi bi-key" />
                                            </span>

                                            <input
                                                id="adminPass"
                                                type={showPass ? "text" : "password"}
                                                className={`form-control ${passErr ? "is-invalid" : ""}`}
                                                required
                                                minLength={6}
                                                placeholder="Enter password"
                                                style={{ borderRadius: 0 }}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />

                                            <button
                                                id="togglePass"
                                                className="btn btn-outline-secondary icon-btn"
                                                type="button"
                                                aria-label={showPass ? "Hide password" : "Show password"}
                                                onClick={() => setShowPass((v) => !v)}
                                            >
                                                <i className={showPass ? "bi bi-eye-slash" : "bi bi-eye"} />
                                            </button>

                                            <div className="invalid-feedback">Please enter your password.</div>
                                        </div>

                                        <div className="mini-note mt-1">Minimum 6 characters.</div>
                                    </div>

                                    {/* ── Remember / Forgot ─────────────────────────── */}
                                    <div className="col-12">
                                        <div
                                            className="border rounded-4 p-3"
                                            style={{
                                                borderColor: "var(--stroke)",
                                                background: "color-mix(in oklab, #0e1629 92%, transparent 8%)",
                                            }}
                                        >
                                            <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center">
                                                <div className="form-check m-0">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="remember"
                                                        checked={remember}
                                                        onChange={(e) => setRemember(e.target.checked)}
                                                    />
                                                    <label className="form-check-label fw-semibold" htmlFor="remember">
                                                        Remember me
                                                    </label>
                                                    <div className="mini-note mt-1">Don't use on public devices.</div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn btn-link link-secondary text-decoration-none small p-0"
                                                    onClick={onForgotPassword}
                                                >
                                                    <i className="bi bi-question-circle" /> Forgot password?
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Actions ───────────────────────────────────── */}
                                    <div className="col-12 d-flex flex-wrap gap-2 justify-content-between align-items-center pt-2">
                                        <div className="mini-note">
                                            <i className="bi bi-lock" /> Encrypted session.
                                        </div>

                                        <div className="d-flex gap-2">
                                            <button type="reset" className="btn btn-outline-secondary" style={{ borderRadius: 14 }}>
                                                Reset
                                            </button>

                                            <button type="submit" className="btn btn-brand px-4" disabled={loading}>
                                                {loading ? "Logging in..." : <>Login <i className="bi bi-arrow-right ms-2" /></>}
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </form>

                            <div className="mini-note mt-4">© {year} NJ Softtech • Admin Portal</div>
                        </section>

                    </div>
                </div>
            </div>

            <PopupAlert
                open={popupOpen}
                type={popupType}
                title={popupType === "success" ? "Success" : "Login Failed"}
                message={popupMessage}
                autoCloseMs={2000}
                onClose={() => setPopupOpen(false)}
            />
        </>
    );
}