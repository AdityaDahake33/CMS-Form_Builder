// import React, { useEffect, useState, useMemo } from "react";
// import { useProject } from "../Context/projectContext";

// type Props = {
//     onMenuClick: () => void;
// };

// const FormHeader: React.FC<Props> = ({ onMenuClick }) => {
//     const [theme, setTheme] = useState<"light" | "dark">("dark");
//     const { admin, roles, isAdminAuthenticated } = useProject();

//     // Get role name from roles list
//     const userRole = useMemo(() => {
//         if (!admin?.roleId || !roles.length) return null;
//         const role = roles.find(r => r.Id === admin.roleId);
//         return role?.Role || "Unknown Role";
//     }, [admin?.roleId, roles]);

//     useEffect(() => {
//     const root = document.documentElement;

//     const saved = localStorage.getItem("theme") as "light" | "dark" | null;

//     const initialTheme = saved || "dark"; // always default dark

//     setTheme(initialTheme);
//     root.setAttribute("data-bs-theme", initialTheme);
// }, []);

//     const toggleTheme = () => {
//         const root = document.documentElement;
//         const next = theme === "dark" ? "light" : "dark";

//         setTheme(next);
//         localStorage.setItem("theme", next);
//         root.setAttribute("data-bs-theme", next);
//     };

//     const isDark = theme === "dark";

//     return (
//         <div className="">
//         <div className="panel mb-3">
//             <div className="panel-head p-3 d-flex align-items-center justify-content-between">
//                 <div className="d-flex align-items-center gap-2">
                 
//                     <button
//                         className="btn btn-outline-secondary btn-sm d-lg-none"
//                         onClick={onMenuClick}
//                     >
//                         <i className="bi bi-list"></i>
//                     </button>

//                     {/* User Information */}
//                     {isAdminAuthenticated && admin && (
//                         <div className="d-flex align-items-center gap-3">
//                             <div className="d-flex align-items-center gap-2">
//                                 <div className="user-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px", fontSize: "14px", fontWeight: "bold" }}>
//                                     {admin.fullName.charAt(0).toUpperCase()}
//                                 </div>
//                                 <div className="d-none d-md-block">
//                                     <div className="fw-semibold small mb-0">{admin.fullName}</div>
//                                     <div className="text-muted small" style={{ fontSize: "11px" }}>
//                                         {admin.emailId} 
//                                         {userRole && <span className="ms-2 badge badge-soft rounded-pill" style={{ fontSize: "10px" }}>{userRole}</span>}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 <div className="d-flex align-items-center gap-2">
//                     {/* Theme Toggle */}
//                     <button
//                         className="btn btn-outline-secondary btn-sm"
//                         onClick={toggleTheme}
//                         type="button"
//                     >
//                         <i className={`bi ${isDark ? "bi-moon-stars" : "bi-sun"}`}></i>
//                         <span className="ms-1 d-none d-md-inline">{isDark ? "Dark" : "Light"}</span>
//                     </button>
//                 </div>
//             </div>
//         </div>
//         </div>
//     );
// };

// export default FormHeader;

import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useProject } from "../Context/projectContext";
import { getOrganizations } from "../Api/Organization/getOrganizationList";

type Props = {
    onMenuClick: () => void;
};

const FormHeader: React.FC<Props> = ({ onMenuClick }) => {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [orgName, setOrgName] = useState<string>("Loading...");

    const { admin, roles, isAdminAuthenticated } = useProject();
    const location = useLocation();

    const isAdminPanel = location.pathname.toLowerCase().startsWith("/admin");
    const isOrgPanel = location.pathname.toLowerCase().startsWith("/organization");

    const userRole = useMemo(() => {
        if (!admin?.roleId || !roles?.length) return admin?.tType || "Admin";
        const role = roles.find(r => r.Id === admin.roleId);
        return role?.Role || admin?.tType || "Admin";
    }, [admin?.roleId, admin?.tType, roles]);

    // ✅ FETCH ORG NAME CORRECTLY
    useEffect(() => {
        const fetchOrgName = async () => {
            try {
                if (!admin?.orgCode) return;

                const { rows } = await getOrganizations({
                    PageNumber: 1,
                    PageSize: 50
                });

                const matchedOrg = rows.find(
                    (org) => Number(org.OrgCode) === Number(admin.orgCode)
                );

                if (matchedOrg?.OrgName) {
                    setOrgName(matchedOrg.OrgName);
                } else {
                    setOrgName(`Organization #${admin.orgCode}`);
                }

            } catch (err) {
                console.error("Org fetch failed:", err);
                setOrgName(`Organization #${admin?.orgCode}`);
            }
        };

        if (isAdminPanel && isAdminAuthenticated && admin?.orgCode) {
            fetchOrgName();
        }
    }, [admin?.orgCode, isAdminPanel, isAdminAuthenticated]);

    // THEME
    useEffect(() => {
        const root = document.documentElement;
        const saved = localStorage.getItem("theme") as "light" | "dark" | null;
        const initialTheme = saved || "dark";

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
        <div>
            <div className="panel mb-3">
                <div className="panel-head p-3 d-flex align-items-center justify-content-between">

                    {/* LEFT */}
                    <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
                        <button
                            className="btn btn-outline-secondary btn-sm d-lg-none"
                            onClick={onMenuClick}
                        >
                            <i className="bi bi-list"></i>
                        </button>

                        {isAdminPanel && isAdminAuthenticated && admin && (
                            <div className="d-flex align-items-center gap-3">
                                <div className="user-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "32px", height: "32px", fontSize: "14px", fontWeight: "bold" }}>
                                    {admin.fullName?.charAt(0).toUpperCase()}
                                </div>

                                <div className="d-none d-md-block">
                                    <div className="fw-semibold small mb-0">{admin.fullName}</div>
                                    <div className="text-muted small" style={{ fontSize: "11px" }}>
                                        {admin.emailId || admin.mobileNo}
                                        {userRole && (
                                            <span className="ms-2 badge badge-soft rounded-pill">
                                                {userRole}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isOrgPanel && (
                            <div className="d-none d-md-block ms-2">
                                <div className="fw-bold small mb-0 text-primary">
                                    Service Provider Portal
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ✅ CENTER */}
                    {isAdminPanel && isAdminAuthenticated && admin && (
                        <div className="text-center" style={{ flex: 1 }}>
                            <div className="fw-bold fs-6 text-white">
                                {orgName}
                            </div>
                            <div className="text-secondary small">
                                Org Code: <span className="fw-bold text-primary">{admin.orgCode}</span>
                            </div>
                        </div>
                    )}

                    {/* RIGHT */}
                    <div className="d-flex justify-content-end" style={{ flex: 1 }}>
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={toggleTheme}
                        >
                            <i className={`bi ${isDark ? "bi-moon-stars" : "bi-sun"}`}></i>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FormHeader;