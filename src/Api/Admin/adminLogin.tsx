// // src/Api/Admin/adminLogin.ts

// export type AdminLoginPayload = {
//     UserName: string;
//     Password: string;
// };

// export type AdminLoginData = {
//     adCode: number;
//     orgCode: number;
//     fullName: string;
//     mobileNo: string;
//     emailId: string;
//     status: "Y" | "N";
//     roleId: number; // ✅ add this
// };

// export type AdminLoginApiResult = {
//     responseCode: number;
//     responseStatus: boolean;
//     responseErrorType: string;
//     responseMessage: string;
//     noOfRecord: number;
//     data: AdminLoginData | null;
// };

// export const adminLogin = async (payload: AdminLoginPayload): Promise<AdminLoginData> => {
//     const baseUrl = import.meta.env.VITE_API_BASE_URL;
//     const apiKey = import.meta.env.VITE_API_KEY;

//     if (!baseUrl) throw new Error("Missing VITE_API_BASE_URL");
//     if (!apiKey) throw new Error("Missing VITE_API_KEY");

//     const fd = new FormData();
//     fd.append("UserName", payload.UserName);
//     fd.append("Password", payload.Password);

//     const res = await fetch(`${baseUrl}/api/Admin/AdminLogin`, {
//         method: "POST",
//         headers: {
//             // ✅ don't set Content-Type for FormData
//             "X-API-KEY": apiKey,

//         },
//         body: fd,
//     });

//     if (!res.ok) throw new Error(`Request failed: ${res.status}`);

//     const result: AdminLoginApiResult = await res.json();
//     console.log("AdminLogin API result:", result); // ✅ debug log

//     if (result.responseCode !== 101 || !result.data) {
//         throw new Error(result.responseMessage || "Admin login failed");
//     }

//     return result.data;
// };


// src/Api/Admin/adminLogin.ts

// export type AdminLoginPayload = {
//     UserName: string;
//     Password: string;
//     OrgCode: string; // ✅ Required — identifies which org this admin belongs to
// };

// export type AdminLoginData = {
//     adCode: number;
//     orgCode: number;
//     fullName: string;
//     mobileNo: string;
//     emailId: string;
//     status: "Y" | "N";
//     roleId: number;
//     tType?: string;
// };

// export type AdminLoginApiResult = {
//     responseCode: number;
//     responseStatus: boolean;
//     responseErrorType: string;
//     responseMessage: string;
//     noOfRecord: number;
//     data: AdminLoginData | null;
// };

// export const adminLogin = async (payload: AdminLoginPayload): Promise<AdminLoginData> => {
//     const baseUrl = import.meta.env.VITE_API_BASE_URL;
//     const apiKey  = import.meta.env.VITE_API_KEY;

//     if (!baseUrl) throw new Error("Missing VITE_API_BASE_URL");
//     if (!apiKey)  throw new Error("Missing VITE_API_KEY");

//     // ✅ OrgCode must be provided — it is used as X-ADMIN-CODE header
//     //    The backend uses X-ADMIN-CODE to scope the login to a specific organization.
//     if (!payload.OrgCode?.trim()) {
//         throw new Error("Organization Code is required to login.");
//     }

//     const fd = new FormData();
//     fd.append("UserName", payload.UserName);
//     fd.append("Password", payload.Password);

//     const res = await fetch(`${baseUrl}/api/Admin/AdminLogin`, {
//         method: "POST",
//         headers: {
//             // ✅ DO NOT set Content-Type for FormData (browser sets boundary automatically)
//             "X-API-KEY":    apiKey,
//             "X-ADMIN-CODE": payload.OrgCode.trim(), // ✅ OrgCode scopes login to the correct org
//         },
//         body: fd,
//     });

//     if (!res.ok) throw new Error(`Request failed: ${res.status}`);

//     const result: AdminLoginApiResult = await res.json();
//     console.log("AdminLogin API result:", result);

//     if (result.responseCode !== 101 || !result.data) {
//         throw new Error(result.responseMessage || "Admin login failed");
//     }

//     return result.data;
// };

// src/Api/Admin/adminLogin.ts
// ✅ FIXED: After a successful API response, we compare the orgCode returned
//    by the backend with the OrgCode the user entered on the login page.
//    If they differ, the user belongs to a different org and the login is rejected.
//    This prevents a DPO/role from Org 7 logging in using Org 5's code.

export type AdminLoginPayload = {
    UserName: string;
    Password: string;
    OrgCode:  string; // entered by user — must match the orgCode in the API response
};

export type AdminLoginData = {
    adCode: number;
    orgCode: number;
    fullName: string;
    mobileNo: string;
    emailId: string;
    status: "Y" | "N";
    roleId: number;
    tType?: string;
};

export type AdminLoginApiResult = {
    responseCode: number;
    responseStatus: boolean;
    responseErrorType: string;
    responseMessage: string;
    noOfRecord: number;
    data: AdminLoginData | null;
};

export const adminLogin = async (payload: AdminLoginPayload): Promise<AdminLoginData> => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const apiKey  = import.meta.env.VITE_API_KEY;

    if (!baseUrl) throw new Error("Missing VITE_API_BASE_URL");
    if (!apiKey)  throw new Error("Missing VITE_API_KEY");

    // ✅ OrgCode must be provided — it is used as X-ADMIN-CODE header
    //    The backend uses X-ADMIN-CODE to scope the login to a specific organization.
    if (!payload.OrgCode?.trim()) {
        throw new Error("Organization Code is required to login.");
    }

    const fd = new FormData();
    fd.append("UserName", payload.UserName);
    fd.append("Password", payload.Password);

    const res = await fetch(`${baseUrl}/api/Admin/AdminLogin`, {
        method: "POST",
        headers: {
            // ✅ DO NOT set Content-Type for FormData (browser sets boundary automatically)
            "X-API-KEY":    apiKey,
            "X-ADMIN-CODE": payload.OrgCode.trim(), // ✅ OrgCode scopes login to the correct org
        },
        body: fd,
    });

    if (!res.ok) throw new Error(`Request failed: ${res.status}`);

    const result: AdminLoginApiResult = await res.json();
    console.log("AdminLogin API result:", result);

    if (result.responseCode !== 101 || !result.data) {
        throw new Error(result.responseMessage || "Admin login failed");
    }

    // ✅ ORG SCOPE VALIDATION:
    // The API returns the orgCode this user actually belongs to.
    // Compare it against the OrgCode entered on the login screen.
    // If they don't match, the user is trying to log into a foreign org — block it.
    const returnedOrgCode = Number(result.data.orgCode);
    const enteredOrgCode  = Number(payload.OrgCode.trim());

    if (returnedOrgCode !== enteredOrgCode) {
        throw new Error(
            "Invalid credentials. The Organization Code does not match your account."
        );
    }

    return result.data;
};