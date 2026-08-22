import React from "react";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground sm:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-mono text-xs tracking-[0.16em] text-primary hover:underline">BACK TO MANTIS</Link>
        <p className="mt-16 font-mono text-xs tracking-[0.16em] text-primary">PRIVACY / SIGNAL POLICY</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">Privacy, by design.</h1>
        <div className="mt-10 space-y-6 text-base leading-8 text-muted-foreground">
          <p>This portfolio is operated by Mantis. The public site does not require an account. The private Studio area uses authentication only for owner access.</p>
          <p>Privacy focused analytics is optional. It is disabled until you choose Allow analytics in the consent notice. If you decline, the analytics script is not loaded. Your choice is stored locally in this browser.</p>
          <p>The site does not sell personal information, run advertising profiles, or request location, camera, microphone, or payment data. Contact information is used only when you choose to contact Mantis directly.</p>
          <p>To withdraw analytics consent, clear this site’s local storage in your browser and reload the page. For privacy questions, contact <a className="text-primary underline" href="mailto:mantisdarling@proton.me">mantisdarling@proton.me</a>.</p>
        </div>
      </div>
    </main>
  );
}
