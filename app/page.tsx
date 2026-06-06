import Link from "next/link";
import { getGitHubRepos } from "@/lib/github";
import GitHubRepos from "@/components/GitHubRepos";

const SKILLS = [
  { name: "React", level: 75 },
  { name: "JavaScript", level: 80 },
  { name: "TypeScript", level: 60 },
  { name: "Python", level: 65 },
  { name: "PHP / Symfony", level: 55 },
  { name: "HTML / CSS", level: 90 },
  { name: "SQL", level: 60 },
  { name: "Git", level: 70 },
];

export default async function Home() {
  const repos = await getGitHubRepos("ThomasDufour19");

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-lg">Thomas Dufour</span>
          <div className="flex gap-6 text-sm text-white/70">
            <a href="#about" className="hover:text-white transition">À propos</a>
            <a href="#skills" className="hover:text-white transition">Compétences</a>
            <a href="#projects" className="hover:text-white transition">Projets</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-24 px-6 text-center max-w-3xl mx-auto">
        <Link href="/dashboard" className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-6 flex items-center justify-center text-3xl font-bold cursor-default select-none">
          TD
        </Link>
        <h1 className="text-5xl font-bold mb-4">
          Thomas{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Dufour
          </span>
        </h1>
        <p className="text-xl text-white/60 mb-2">
          Développeur Web — Étudiant MyDigital School
        </p>
        <p className="text-white/40 mb-8">
          Angers, France · Recherche alternance développement web
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="https://github.com/ThomasDufour19"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
            </svg>
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/thomas-dufour-358854252/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            LinkedIn
          </a>
        </div>
      </section>

      {/* ── À PROPOS ── */}
      <section id="about" className="py-20 px-6 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">À propos</h2>
          <p className="text-white/70 leading-relaxed text-lg">
            Étudiant en développement web à <strong className="text-white">MyDigital School</strong>,
            je suis passionné par la création d&apos;applications web modernes.
            À la recherche d&apos;une alternance en développement web (React, JavaScript, TypeScript, Python),
            je construis des projets personnels et j&apos;automatise des processus pour progresser continuellement.
          </p>
        </div>
      </section>

      {/* ── COMPÉTENCES ── */}
      <section id="skills" className="py-20 px-6 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-10">Compétences</h2>
          <div className="grid gap-4">
            {SKILLS.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-white/40">{skill.level}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJETS GITHUB ── */}
      <section id="projects" className="py-20 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Projets GitHub</h2>
          <p className="text-white/40 text-sm mb-10">Mis à jour automatiquement depuis GitHub</p>
          <GitHubRepos repos={repos} />
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 px-6 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Contact</h2>
          <p className="text-white/60 mb-8">
            Disponible pour une alternance dès maintenant
          </p>
          <div className="flex gap-4 justify-center flex-wrap text-sm">
            <a
              href="mailto:dufourthomas159@gmail.com"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              ✉️ dufourthomas159@gmail.com
            </a>
            <a
              href="tel:+33769455071"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              📞 +33 7 69 45 50 71
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-white/10 text-center text-white/30 text-sm">
        © 2026 Thomas Dufour · MyDigital School
      </footer>
    </main>
  );
}
