// One-shot hairline frame for the editor — auto-draws top, then both sides,
// when an ancestor has the .write-orchestrate class. Animation styles in
// globals.css. Place inside a `position: relative` parent.

export default function WorkspaceFrame() {
  return (
    <svg
      className="workspace-frame absolute inset-0 pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="wf-top" d="M 0 0 L 100 0" pathLength={100} vectorEffect="non-scaling-stroke" />
      <path className="wf-right" d="M 100 0 L 100 100" pathLength={100} vectorEffect="non-scaling-stroke" />
      <path className="wf-left" d="M 0 0 L 0 100" pathLength={100} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
