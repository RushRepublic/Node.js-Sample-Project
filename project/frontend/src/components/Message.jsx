// Shows a green success box or a red error box. Shows nothing if there is no message.
export default function Message({ type, text }) {
  if (!text) return null;
  return <div className={`message ${type}`}>{text}</div>;
}
