import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary text-white py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm">
        &copy; {currentYear} H&S Elektrotechnik GmbH - Zeiterfassungssystem
      </div>
    </footer>
  );
}
