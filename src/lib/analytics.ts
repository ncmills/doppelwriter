import posthog from "posthog-js";

function isPostHogLoaded(): boolean {
  try {
    return posthog.__loaded === true;
  } catch {
    return false;
  }
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (!isPostHogLoaded()) return;
  posthog.capture(eventName, properties);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!isPostHogLoaded()) return;
  posthog.identify(userId, properties);
}

// Funnel events
export function trackSignup(method: string = "email"): void {
  trackEvent("signup", { method });
}

export function trackLogin(method: string = "email"): void {
  trackEvent("login", { method });
}

// Product events
export function trackFirstGeneration(): void {
  trackEvent("first_generation");
}

export function trackEdit(profileName?: string): void {
  trackEvent("edit_started", { profile: profileName });
}

export function trackGenerate(profileName?: string): void {
  trackEvent("generate_started", { profile: profileName });
}

export function trackVoiceProfileCreated(name?: string): void {
  trackEvent("voice_profile_created", { name });
}

export function trackProfileBuildStarted(): void {
  trackEvent("profile_build_started");
}

export function trackSampleUploaded(sourceType: string, wordCount: number): void {
  trackEvent("sample_uploaded", { sourceType, wordCount });
}

// Engagement events
export function trackShare(): void {
  trackEvent("share");
}

export function trackReferralClick(): void {
  trackEvent("referral_click");
}

export function trackCopyOutput(): void {
  trackEvent("copy_output");
}

export function trackDownloadOutput(): void {
  trackEvent("download_output");
}

export function trackAcceptEdit(): void {
  trackEvent("accept_edit");
}

export function trackRevisionRequested(): void {
  trackEvent("revision_requested");
}

// Conversion events
export function trackUpgradeModalShown(): void {
  trackEvent("upgrade_modal_shown");
}

export function trackUpgradeClicked(source: string): void {
  trackEvent("upgrade_clicked", { source });
}

export function trackCtaClicked(cta: string, page: string): void {
  trackEvent("cta_clicked", { cta, page });
}

// Tool events
export function trackToneCheckerUsed(): void {
  trackEvent("tone_checker_used");
}

export function trackVoiceAnalyzerUsed(): void {
  trackEvent("voice_analyzer_used");
}

// Writer selection
export function trackWriterSelected(writerName: string, category: string): void {
  trackEvent("writer_selected", { writerName, category });
}
