// Screen state types copied from ned-landing/src/scene/poses.ts (types only; no scroll or scene code).
// In the video these states are computed from the frame number in the scene components.
export type BriefState = { added: number; draft: string; panel: 'closed' | 'sign'; created: boolean };
export type SubmitState = { links: number; draft: string; files: number; scanned: number; checks: number; panel: 'closed' | 'sign'; done: boolean };
