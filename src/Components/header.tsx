import React, { useEffect, useState, useMemo } from "react";
import { useProject } from "../Context/projectContext";

type Props = {
    onMenuClick: () => void;
};

const FormHeader: React.FC<Props> = ({ onMenuClick }) => {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const { admin, roles, isAdminAuthenticated } = useProject();

    // Get role name from roles list
    const userRole = useMemo(() => {
        if (!admin?.roleId || !roles.length) return null;
        const role = roles.find(r => r.Id === admin.roleId);
        return role?.Role || "Unknown Role";
    }, [admin?.roleId, roles]);

    useEffect(() => {
    const root = document.documentElement;

    const saved = localStorage.getItem("theme") as "light" | "dark" | null;

    const initialTheme = saved || "dark"; // always default dark

    setTheme(initialTheme);
    root.setAttribute("data-bs-theme", initialTheme);
}, []);

    const toggleTheme = () => {
        const root = document.documentElement;
        const next = theme === "dark" ? "light" : "dark";

        setTheme(next);
        localStorage.setItem("theme", next);
        root.setAttribute("data-bs-theme", next);
    };

    const isDark = theme === "dark";

    return (
        <div className="">
        <div className="panel mb-3">
            <div className="panel-head p-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                 
                    <button
                        className="btn btn-outline-secondary btn-sm d-lg-none"
                        onClick={onMenuClick}
                    >
                        <i className="bi bi-list"></i>
                    </button>

                    {/* User Information */}
                    {isAdminAuthenticated && admin && (
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <div className="user-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px", fontSize: "14px", fontWeight: "bold" }}>
                                    {admin.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="d-none d-md-block">
                                    <div className="fw-semibold small mb-0">{admin.fullName}</div>
                                    <div className="text-muted small" style={{ fontSize: "11px" }}>
                                        {admin.emailId} 
                                        {userRole && <span className="ms-2 badge badge-soft rounded-pill" style={{ fontSize: "10px" }}>{userRole}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="d-flex align-items-center gap-2">
                    {/* Theme Toggle */}
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={toggleTheme}
                        type="button"
                    >
                        <i className={`bi ${isDark ? "bi-moon-stars" : "bi-sun"}`}></i>
                        <span className="ms-1 d-none d-md-inline">{isDark ? "Dark" : "Light"}</span>
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
};

export default FormHeader;
