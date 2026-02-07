"use client";

import InstallPWAButtonPremium from "./InstallPWAButtonPremium";
import IosInstallHintPremium from "./IosInstallHintPremium";

export default function ClientOverlays() {
  return (
    <>
      <InstallPWAButtonPremium delayMs={15000} dismissDays={7} requireInteraction />
      <IosInstallHintPremium delayMs={30000} dismissDays={7} requireInteraction />
    </>
  );
}
