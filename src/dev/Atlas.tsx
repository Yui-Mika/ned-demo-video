import React from "react";
import { AbsoluteFill } from "remotion";
import { HomeScreen } from "../ui/phone/HomeScreen";
import { ContractAcceptScreen } from "../ui/phone/ContractAcceptScreen";
import { ContractLockScreen } from "../ui/phone/ContractLockScreen";
import { ContractLockedScreen } from "../ui/phone/ContractLockedScreen";
import { MilestoneReviewScreen } from "../ui/phone/MilestoneReviewScreen";
import { MilestoneReleasedScreen } from "../ui/phone/MilestoneReleasedScreen";
import { ContractAnyoneActionScreen } from "../ui/phone/ContractAnyoneActionScreen";
import { DisclosuresScreen } from "../ui/phone/DisclosuresScreen";
import { WebContractNewScreen } from "../ui/web/WebContractNewScreen";
import { WebSubmitScreen } from "../ui/web/WebSubmitScreen";
import { WebWorkspaceScreen } from "../ui/web/WebWorkspaceScreen";
import { ContractDetailScreen } from "../ui/phone/ContractDetailScreen";

// Dev only: every screen flat at native size, for measuring element positions.
const box = (x: number, y: number, el: React.ReactNode, id: string) => (
  <div data-atlas={id} style={{ position: "absolute", left: x, top: y }}>{el}</div>
);
export const Atlas: React.FC = () => (
  <AbsoluteFill style={{ background: "#333" }}>
    {box(0, 0, <HomeScreen view="vn" />, "home")}
    {box(400, 0, <ContractAcceptScreen />, "accept")}
    {box(800, 0, <ContractLockScreen />, "lock")}
    {box(1200, 0, <ContractLockedScreen side="freelancerVN" />, "locked")}
    {box(1600, 0, <MilestoneReviewScreen hideCountdown />, "review")}
    {box(2000, 0, <MilestoneReleasedScreen variant="client" />, "released")}
    {box(2400, 0, <ContractAnyoneActionScreen kind="release" />, "anyRelease")}
    {box(2800, 0, <ContractAnyoneActionScreen kind="refund" />, "anyRefund")}
    {box(3200, 0, <MilestoneReleasedScreen variant="refund" />, "refunded")}
    {box(3600, 0, <DisclosuresScreen />, "disclosures")}
    {box(0, 900, <WebContractNewScreen state={{ added: 4, draft: "", panel: "closed", created: false }} width={1440} height={2600} />, "contractNew")}
    {box(1500, 900, <WebSubmitScreen state={{ links: 2, draft: "", files: 2, scanned: 2, checks: 4, panel: "closed", done: false }} width={1440} height={2600} />, "submit")}
    {box(3000, 900, <WebSubmitScreen state={{ links: 2, draft: "", files: 2, scanned: 2, checks: 4, panel: "sign", done: false }} width={1440} height={900} />, "submitSign")}
    {box(3000, 1850, <WebSubmitScreen state={{ links: 2, draft: "", files: 2, scanned: 2, checks: 4, panel: "closed", done: true }} width={1440} height={900} />, "submitDone")}
    {box(0, 2700, <ContractDetailScreen variant="vinhNew" />, "detailNew")}
    {box(400, 2700, <ContractDetailScreen variant="vinhAccepted" />, "detailAccepted")}
    {box(900, 2700, <WebWorkspaceScreen width={1440} height={900} panel={null} />, "workspace")}
    {box(2400, 2700, <WebWorkspaceScreen width={1440} height={900} panel={<ContractLockScreen />} />, "workspacePanel")}
  </AbsoluteFill>
);
