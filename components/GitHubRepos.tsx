import { GitHubRepo } from "@/lib/github";

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Java: "#b07219",
};

interface Props {
  repos: GitHubRepo[];
}

export default function GitHubRepos({ repos }: Props) {
  if (repos.length === 0) {
    return (
      <p className="text-white/40 text-sm">
        Impossible de charger les repos GitHub pour le moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {repos.slice(0, 9).map((repo) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition group"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-sm group-hover:text-blue-400 transition truncate pr-2">
              {repo.name}
            </h3>
            <svg
              className="w-4 h-4 text-white/30 group-hover:text-blue-400 shrink-0 transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
          <p className="text-white/50 text-xs mb-4 line-clamp-2 min-h-[2rem]">
            {repo.description ?? "Pas de description"}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: LANG_COLORS[repo.language] ?? "#888",
                  }}
                />
                {repo.language}
              </span>
            )}
            {repo.stargazers_count > 0 && (
              <span>⭐ {repo.stargazers_count}</span>
            )}
            <span className="ml-auto">
              {new Date(repo.updated_at).toLocaleDateString("fr-FR", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
