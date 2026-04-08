export default function KidPhoto({ kid, className = "kid-photo" }) {
  if (kid.photo) {
    return <img className={className} src={kid.photo} alt={kid.name} />;
  }
  const parts = kid.name.trim().split(" ");
  const initials = parts.length > 1
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0][0];
  return <div className={`${className} kid-photo-placeholder`}>{initials}</div>;
}
