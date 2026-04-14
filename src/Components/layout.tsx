// import React, { useState } from "react";
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// import Sidebar from "./sidebar";
// import FormHeader from "./header";

// import FormBuilder from "../formbuilder/formbuilder";
// import FormsPage from "../formbuilder/formReport";
// import SubmissionsReport from "../formbuilder/submissionReport";
// // import AllFormReport from "../Admin/AllFormReport";
// // import UserRolePermissionPage from "../Admin/UserPermission";
// import Dashboard from "../Admin/Dashboard";
// import AdminLogin from "../Admin/AdminLogin";
// import PublicFormView from "../formbuilder/publicForm";
// import OrganizationLogin from "../Organization/organizationLogin";
// import AddOrganization from "../Organization/addOrganization";
// import ProtectedRoute from "../protectedRoute";
// import OrganizationDashboard from "../Organization/OrganizationDashboard";
// import AddAdmin from "../Admin/AddAdmin";
// import MyFormDetails from "../formbuilder/myFormDetail";
// import ConsentWithdrawRequest from "../formbuilder/consentWithdrawReport";
// import PrivacyNoticePage from "../Admin/PrivacyNoticePage";
// import GrievancesPage from "../Admin/GrievancesPage";


// const Layout: React.FC = () => {
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const location = useLocation();

//     const standalonePaths = [
//         "/admin/AdminLogin",
//         "/organization/organizationLogin",
//         "/PublicFormView",
//         "/myFormDetails",
//     ];

//     const isStandalonePage = standalonePaths.includes(location.pathname);

//     // ✅ Standalone pages (no sidebar/header)
//     if (isStandalonePage) {
//         return (
//             <Routes>
//                 <Route path="/admin/AdminLogin" element={<AdminLogin />} />
//                 <Route path="/organization/organizationLogin" element={<OrganizationLogin />} />
//                 <Route path="/PublicFormView" element={<PublicFormView />} />
//                 <Route path="/myFormDetails" element={<MyFormDetails />} />

//                 {/* ✅ page not found without sidebar */}
//                 <Route
//                     path="*"
//                     element={
//                         <div className="container py-5">
//                             <div className="alert alert-warning mb-0">Page not found</div>
//                         </div>
//                     }
//                 />
//             </Routes>
//         );
//     }

//     // ✅ Normal layout
//     return (
//         <div className="app-shell">
//             {sidebarOpen && (
//                 <div
//                     className="sidebar-backdrop d-lg-none"
//                     onClick={() => setSidebarOpen(false)}
//                 />
//             )}

//             <div className="app-layout">
//                 <div className={`sidebar-wrapper ${sidebarOpen ? "open" : ""}`}>
//                     <Sidebar
//                         onClose={() => setSidebarOpen(false)}
//                         onNav={() => setSidebarOpen(false)}
//                     />
//                 </div>

//                 <main className="app-main">
//                     <FormHeader onMenuClick={() => setSidebarOpen(true)} />

//                     <div className="builder-host">
//                         <Routes>
//                             {/* organization Route */}
//                             <Route
//                                 path="/organization/addOrganization"
//                                 element={
//                                     <ProtectedRoute type="organization">
//                                         <AddOrganization />
//                                     </ProtectedRoute>
//                                 }
//                             />

//                             <Route
//                                 path="/organization/OrganizationDashboard"
//                                 element={
//                                     <ProtectedRoute type="organization">
//                                         <OrganizationDashboard />
//                                     </ProtectedRoute>
//                                 }
//                             />

//                             {/* Admin Route */}
//                             <Route
//                                 path="/admin/dashboard"
//                                 element={
//                                     <ProtectedRoute type="admin">
//                                         <Dashboard />
//                                     </ProtectedRoute>
//                                 }
//                             />

//                             <Route
//                                 path="/admin/addAdmin"
//                                 element={
//                                     <ProtectedRoute type="admin">
//                                         <AddAdmin />
//                                     </ProtectedRoute>
//                                 }
//                             />

//                                 <Route
//                                 path="/admin/grievances"
//                                 element={
//                                     <ProtectedRoute type="admin">
//                                         <GrievancesPage />
//                                     </ProtectedRoute>
//                                 }
//                             /> 
                            
//                              {/*  NEW ROUTE ADDED HERE */}
//                             <Route
//                                 path="/admin/privacyNotices"
//                                 element={
//                                     <ProtectedRoute type="admin">
//                                         <PrivacyNoticePage />
//                                     </ProtectedRoute>
//                                 }
//                             />

//                             {/* <Route
//                                 path="/admin/userPermissions"
//                                 element={
//                                     <ProtectedRoute type="admin">
//                                         <UserRolePermissionPage />
//                                     </ProtectedRoute>
//                                 }
//                             /> */}

//                             {/* <Route
//                                 path="/admin/allforms"
//                                 element={
//                                     <ProtectedRoute type="admin">
//                                         <AllFormReport />
//                                     </ProtectedRoute>
//                                 }
//                             /> */}

//                             {/* sub-admin/user Route */}
//                             <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
//                             <Route path="/builder" element={<FormBuilder />} />
//                             <Route path="/forms" element={<FormsPage />} />
//                             <Route path="/submissions" element={<SubmissionsReport />} />
//                             <Route path="/withdrawRequest" element={<ConsentWithdrawRequest />} />

//                             {/* ✅ page not found with sidebar for normal pages */}
//                             {/* <Route
//                                 path="*"
//                                 element={<div className="p-4 text-secondary">Page not found</div>}
//                             /> */}
//                         </Routes>
//                     </div>
//                 </main>
//             </div>
//         </div>
//     );
// };

// export default Layout;

import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./sidebar";
import FormHeader from "./header";

import FormBuilder from "../formbuilder/formbuilder";
import FormsPage from "../formbuilder/formReport";
import SubmissionsReport from "../formbuilder/submissionReport";
import Dashboard from "../Admin/Dashboard";
import AdminLogin from "../Admin/AdminLogin";
import PublicFormView from "../formbuilder/publicForm";
import OrganizationLogin from "../Organization/organizationLogin";
import AddOrganization from "../Organization/addOrganization";
import ProtectedRoute from "../protectedRoute";
import OrganizationDashboard from "../Organization/OrganizationDashboard";
import AddAdmin from "../Admin/AddAdmin";
import MyFormDetails from "../formbuilder/myFormDetail";
import ConsentWithdrawRequest from "../formbuilder/consentWithdrawReport";
import PrivacyNoticePage from "../Admin/PrivacyNoticePage";
import GrievancesPage from "../Admin/GrievancesPage";
import DbCluster from "../Organization/DbCluster";
import Logs from "../Organization/Logs";
import Billing from "../Organization/BillingPlan";

const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const standalonePaths = [
        "/admin/AdminLogin",
        "/organization/organizationLogin",
        "/PublicFormView",
        "/myFormDetails",
    ];

    const isStandalonePage = standalonePaths.includes(location.pathname);

    // ✅ Standalone pages (no sidebar/header)
    if (isStandalonePage) {
        return (
            <Routes>
                <Route path="/admin/AdminLogin" element={<AdminLogin />} />
                <Route path="/organization/organizationLogin" element={<OrganizationLogin />} />
                <Route path="/PublicFormView" element={<PublicFormView />} />
                <Route path="/myFormDetails" element={<MyFormDetails />} />

                {/* ✅ page not found without sidebar */}
                <Route
                    path="*"
                    element={
                        <div className="container py-5">
                            <div className="alert alert-warning mb-0">Page not found</div>
                        </div>
                    }
                />
            </Routes>
        );
    }

    // ✅ Normal layout
    return (
        <div className="app-shell">
            {sidebarOpen && (
                <div
                    className="sidebar-backdrop d-lg-none"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="app-layout">
                <div className={`sidebar-wrapper ${sidebarOpen ? "open" : ""}`}>
                    <Sidebar
                        onClose={() => setSidebarOpen(false)}
                        onNav={() => setSidebarOpen(false)}
                    />
                </div>

                <main className="app-main">
                    <FormHeader onMenuClick={() => setSidebarOpen(true)} />
                    <div className="builder-host">
                        <Routes>
                            {/* Organization Routes */}
                            <Route
                                path="/organization/addOrganization"
                                element={
                                    <ProtectedRoute type="organization">
                                        <AddOrganization />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/organization/OrganizationDashboard"
                                element={
                                    <ProtectedRoute type="organization">
                                        <OrganizationDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/organization/DbCluster"
                                element={
                                    <ProtectedRoute type="organization">
                                        <DbCluster />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/organization/Logs"
                                element={
                                    <ProtectedRoute type="organization">
                                        <Logs />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/organization/Billing"
                                element={
                                    <ProtectedRoute type="organization">
                                        <Billing />
                                    </ProtectedRoute>
                                }
                            />


                            {/* Admin Routes */}
                            <Route
                                path="/admin/dashboard"
                                element={
                                    <ProtectedRoute type="admin">
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/admin/addAdmin"
                                element={
                                    <ProtectedRoute type="admin">
                                        <AddAdmin />
                                    </ProtectedRoute>
                                }
                            />

                             <Route
                                path="/admin/privacyNotices"
                                element={
                                    <ProtectedRoute type="admin">
                                        <PrivacyNoticePage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route 
                                path="/admin/builder" 
                                element={
                                    <ProtectedRoute type="admin">
                                        <FormBuilder />
                                    </ProtectedRoute>
                                } 
                            />
                            
                            <Route 
                                path="/admin/forms" 
                                element={
                                    <ProtectedRoute type="admin">
                                        <FormsPage />
                                    </ProtectedRoute>
                                } 
                            />
                            
                            <Route 
                                path="/admin/submissions" 
                                element={
                                    <ProtectedRoute type="admin">
                                        <SubmissionsReport />
                                    </ProtectedRoute>
                                } 
                            />
                            
                            <Route 
                                path="/admin/withdrawRequest" 
                                element={
                                    <ProtectedRoute type="admin">
                                        <ConsentWithdrawRequest />
                                    </ProtectedRoute>
                                } 
                            />

                            <Route
                                path="/admin/grievances"
                                element={
                                    <ProtectedRoute type="admin">
                                        <GrievancesPage />
                                    </ProtectedRoute>
                                }
                            />                          

                            {/* 👉 FIXED REDIRECTS: Passes URL params and state to the new admin routes */}
                            <Route path="/forms" element={<Navigate to={{ pathname: "/admin/forms", search: location.search }} state={location.state} replace />} />
                            <Route path="/builder" element={<Navigate to={{ pathname: "/admin/builder", search: location.search }} state={location.state} replace />} />
                            <Route path="/submissions" element={<Navigate to={{ pathname: "/admin/submissions", search: location.search }} state={location.state} replace />} />
                            <Route path="/withdrawRequest" element={<Navigate to={{ pathname: "/admin/withdrawRequest", search: location.search }} state={location.state} replace />} />

                            {/* Root Fallback */}
                            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                            
                            {/* Generic Fallback */}
                            <Route
                                path="*"
                                element={<div className="p-4 text-secondary">Page not found</div>}
                            />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;