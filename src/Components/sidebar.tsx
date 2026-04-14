// import React, { useMemo } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import { useOrganizationAuth } from "../Context/organizationContext";
// import { useProject } from "../Context/projectContext";

// type Props = {
//     onClose: () => void;
//     onNav?: () => void;
// };

// const menuIconClass = (icon: string) => {
//     switch ((icon || "").toLowerCase()) {
//         case "dashboard":
//             return "bi-speedometer2";
//         case "admin_panel":
//             return "bi-person";
//         case "form":
//             return "bi-ui-checks-grid";
//         case "list":
//             return "bi-list-check";
//         case "organization":
//             return "bi-building";
//         default:
//             return "bi-circle";
//     }
// };

// const Sidebar: React.FC<Props> = ({ onClose, onNav }) => {
//     const location = useLocation();

//     const {
//         logout,
//         isAuthenticated: isOrgAuthenticated,
//     } = useOrganizationAuth();

//     const {
//         logoutAdmin,
//         isAdminAuthenticated,
//         menus, 
//         adminMenus,
//         adminMenusLoading,
//     } = useProject();

//     const pathname = location.pathname.toLowerCase();

//     const isAdminRoute =
//     pathname.startsWith("/admin") ||
//     pathname.startsWith("/builder") ||
//     pathname.startsWith("/forms") ||
//     pathname.startsWith("/submissions") ||
//     pathname.startsWith("/withdrawRequest");
//     const isOrgRoute = pathname.startsWith("/organization");

//     const sidebarMode: "admin" | "organization" | "none" = useMemo(() => {
//         // route should always win
//         if (isAdminRoute) return "admin";
//         if (isOrgRoute) return "organization";

//         // fallback only if exactly one auth is active
//         if (isAdminAuthenticated && !isOrgAuthenticated) return "admin";
//         if (isOrgAuthenticated && !isAdminAuthenticated) return "organization";

//         return "none";
//     }, [isAdminRoute, isOrgRoute, isAdminAuthenticated, isOrgAuthenticated]);

//     // const allowedPageIds = useMemo(() => {
//     //     return new Set((adminMenus || []).map((x) => Number(x.PageId)));
//     // }, [adminMenus]);

//     const visibleAdminMenus = useMemo(() => {
//     return [...(adminMenus || [])].sort(
//         (a, b) => Number(a.SortOrder) - Number(b.SortOrder)
//     );
// }, [adminMenus]);

// console.log("menus:", menus);
// console.log("adminMenus:", adminMenus);
// console.log("visibleAdminMenus:", visibleAdminMenus);
// console.log("sidebarMode:", sidebarMode);

// const loadingAdminMenu = adminMenusLoading;

//     return (
//         <aside className="sidebar p-3">
//             <button
//                 className="btn btn-outline-secondary btn-sm d-lg-none mb-3"
//                 onClick={onClose}
//                 type="button"
//             >
//                 <i className="bi bi-x-lg" />
//             </button>

//             <div className="d-flex align-items-center gap-3 p-2 panel">
//                 <div className="brand-badge">FF</div>
//                 <div>
//                     <div className="fw-bold">NJ Softtech</div>
//                     <div className="text-secondary small">
//                         {sidebarMode === "admin"
//                             ? "Admin Panel"
//                             : sidebarMode === "organization"
//                                 ? "Organization"
//                                 : ""}
//                     </div>
//                 </div>
//             </div>

//             <div className="mt-3 nav nav-pills flex-column gap-2">
//                 {sidebarMode === "organization" && (
//                     <>
//                         <NavLink
//                             to="/organization/OrganizationDashboard"
//                             className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
//                             onClick={onNav}
//                         >
//                             <i className="bi bi-speedometer2 me-2" />
//                             Dashboard
//                         </NavLink>

//                         <NavLink
//                             to="/organization/addOrganization"
//                             className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
//                             onClick={onNav}
//                         >
//                             <i className="bi bi-building me-2" />
//                             Organization
//                         </NavLink>

//                         <button
//                             className="btn btn-danger mt-2"
//                             onClick={logout}
//                             type="button"
//                         >
//                             Logout
//                         </button>
//                     </>
//                 )}

//                  {sidebarMode === "admin" && (
//     <>
//         {loadingAdminMenu ? (
//             <div className="text-secondary small px-2 py-1">
//                 Loading menu...
//             </div>
//         ) : visibleAdminMenus.length === 0 ? (
//             <div className="text-danger small px-2 py-1">
//                 No menu found
//             </div>
//         ) : (
//             visibleAdminMenus.map((m) => (
//                 <NavLink
//                     key={m.Id}
//                     to={m.Route}
//                     className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
//                     onClick={onNav}
//                     id={m.PageKey}
//                 >
//                     <i className={`bi ${menuIconClass(m.Icon)} me-2`} />
//                     {m.PageName}
//                 </NavLink>
//             ))
//         )}  
//         <NavLink
//     to="/admin/privacyNotices"
//     className={({ isActive }) =>
//         `nav-link ${isActive ? "active" : ""}`
//     }
//     onClick={onNav}
// >
//     <i className="bi bi-file-earmark-lock2 me-2" />
//     Privacy Notices
// </NavLink>
//                         <NavLink to="/admin/grievances" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
//                             <i className="bi bi-exclamation-octagon me-2" /> Grievances
//                         </NavLink>
//         <button
//             className="btn btn-danger mt-2"
//             onClick={logoutAdmin}
//             type="button"
//         >
//             Logout
//         </button>
//     </>
// )}


//             </div>
//         </aside>

        
//     );

    
// };

// export default Sidebar;

import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useOrganizationAuth } from "../Context/organizationContext";
import { useProject } from "../Context/projectContext";

type Props = {
    onClose: () => void;
    onNav?: () => void;
};

const Sidebar: React.FC<Props> = ({ onClose, onNav }) => {
    const location = useLocation();

    const {
        logout,
        isAuthenticated: isOrgAuthenticated,
    } = useOrganizationAuth();

    const {
        logoutAdmin,
        isAdminAuthenticated,
    } = useProject();

    const pathname = location.pathname.toLowerCase();

    const isAdminRoute = pathname.startsWith("/admin");
    const isOrgRoute = pathname.startsWith("/organization");

    const sidebarMode: "admin" | "organization" | "none" = useMemo(() => {
        if (isAdminRoute) return "admin";
        if (isOrgRoute) return "organization";
        if (isAdminAuthenticated && !isOrgAuthenticated) return "admin";
        if (isOrgAuthenticated && !isAdminAuthenticated) return "organization";
        return "none";
    }, [isAdminRoute, isOrgRoute, isAdminAuthenticated, isOrgAuthenticated]);

    return (
        <aside className="sidebar p-3">
            <button
                className="btn btn-outline-secondary btn-sm d-lg-none mb-3"
                onClick={onClose}
                type="button"
            >
                <i className="bi bi-x-lg" />
            </button>

            <div className="d-flex align-items-center gap-3 p-2 panel">
                <div className="brand-badge">FF</div>
                <div>
                    <div className="fw-bold">NJ Softtech</div>
                    <div className="text-secondary small">
                        {sidebarMode === "admin"
                            ? "Admin Panel"
                            : sidebarMode === "organization"
                                ? "Organization"
                                : ""}
                    </div>
                </div>
            </div>

            <div className="mt-3 nav nav-pills flex-column gap-2">
                {sidebarMode === "organization" && (
                    <>
                        <NavLink to="/organization/OrganizationDashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-speedometer2 me-2" /> Dashboard
                        </NavLink>
                        <NavLink to="/organization/addOrganization" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-building me-2" /> Organization
                        </NavLink>
                        <NavLink to="/organization/DbCluster" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-database me-2" /> DB Cluster
                        </NavLink>
                        <NavLink to="/organization/Logs" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-list me-2" /> Logs
                        </NavLink>
                        <NavLink to="/organization/Billing" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-credit-card me-2" /> Billing
                        </NavLink>
                        <button className="btn btn-danger mt-2" onClick={logout} type="button">
                            Logout
                        </button>

                    </>
                )}

                {sidebarMode === "admin" && (
                    <>
                        {/* 1. Dashboard */}
                        <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-speedometer2 me-2" /> Dashboard
                        </NavLink>
                        
                        {/* 2. Role List (Previously Add Admin / User List) */}
                        <NavLink to="/admin/addAdmin" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-people me-2" /> Role List
                        </NavLink>
                        
                        {/* 3. Privacy Notice */}
                        <NavLink to="/admin/privacyNotices" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-file-earmark-lock2 me-2" /> Privacy Notices
                        </NavLink>

                        {/* 4. Add New Form */}
                        <NavLink to="/admin/builder" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-ui-checks-grid me-2" /> Add New Form
                        </NavLink>
                        
                        {/* 5. Form List */}
                        <NavLink to="/admin/forms" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-list-check me-2" /> Form List
                        </NavLink>
                        
                        {/* 6. Form Response */}
                        <NavLink to="/admin/submissions" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-envelope-paper me-2" /> Form Responses
                        </NavLink>

                        {/* 7. Consent Withdraw Request */}
                        <NavLink to="/admin/withdrawRequest" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-shield-x me-2" /> Withdraw Requests
                        </NavLink>

                        {/* 8. Grievances */}
                        <NavLink to="/admin/grievances" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNav}>
                            <i className="bi bi-exclamation-octagon me-2" /> Grievances
                        </NavLink>

                        {/* 9. Logout */}
                        <button className="btn btn-danger mt-4" onClick={logoutAdmin} type="button">
                            Logout
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;