"use client";

export default function ColyseusStatus({ label, variant = "dark" }) {
  const muted = variant === "light" ? "text-neutral-500" : "text-[#93a0b5]";
  const value = variant === "light" ? "text-black" : "text-[#3ecf8e]";
  return (
    <p className={`text-sm ${muted}`}>
      Colyseus: <span className={value}>{label}</span>
    </p>
  );
}
