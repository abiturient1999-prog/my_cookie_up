const ROOT_URL = "https://basedcookie.vercel.app";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  baseBuilder: {
    ownerAddress: "0x3f08e5e286c474CcaF93a853e9a710Dd7212ba07",
  },
  miniapp: {
    version: "1",
    name: "Based Cookie",
    subtitle: "",
    description: "",
    screenshotUrls: [],
    iconUrl: ROOT_URL,
    splashImageUrl: ROOT_URL,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: ROOT_URL,
    primaryCategory: "utility",
    tags: ["example"],
    heroImageUrl: ROOT_URL,
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: ROOT_URL,
  },
} as const;
