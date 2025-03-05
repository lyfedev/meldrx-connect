import IMeldRxLaunchData from "./IMeldRxLaunchData";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL ?? "";
const MELDRX_CLIENT_ID = process.env.NEXT_PUBLIC_MELDRX_CLIENT_ID ?? "";
const MELDRX_WORKSPACE_URL = process.env.NEXT_PUBLIC_MELDRX_WORKSPACE_URL ?? "";
const MELDRX_SCOPE = process.env.NEXT_PUBLIC_MELDRX_SCOPE ?? "";

// Configure all the different workspaces you want to launch...
export const launchOptions: IMeldRxLaunchData[] = [
    {
        clientId: MELDRX_CLIENT_ID,
        workspaceUrl: MELDRX_WORKSPACE_URL,
        scope: MELDRX_SCOPE,
        redirectUrl: `${APP_BASE_URL}/login-callback`,
    },
];