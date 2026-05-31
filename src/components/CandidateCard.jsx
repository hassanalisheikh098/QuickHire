import { Link } from 'react-router-dom'

const AVATAR_COLORS = [
  'from-primary to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-orange-400 to-red-500',
  'from-cyan-400 to-blue-500',
]

export default function CandidateCard({ candidate, onSave, saved = false }) {
  const colorClass = AVATAR_COLORS[candidate.id % AVATAR_COLORS.length]

  return (
    <div className="bg-card-dark border border-border-dark rounded-xl p-6 relative hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all group">
      {/* AI Score Badge */}
      <div className="absolute top-4 right-4 bg-primary/10 px-3 py-1 rounded-full">
        <span className="mono-font text-primary text-sm font-bold">{candidate.ai_score} AI</span>
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-border-dark p-1 mb-4 group-hover:border-primary transition-colors">
          {candidate.avatar_url ? (
            <img
              src={candidate.avatar_url}
              alt={candidate.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className={`w-full h-full rounded-full bg-gradient-to-tr ${colorClass} flex items-center justify-center text-background-dark font-bold text-xl`}>
              {candidate.name?.charAt(0) ?? '?'}
            </div>
          )}
        </div>
        <h3 className="text-white text-xl font-bold mb-1">{candidate.name}</h3>
        <p className="text-slate-400 text-sm">{candidate.title}</p>
        {candidate.location && (
          <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {candidate.location}
          </p>
        )}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(candidate.skills || []).slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 bg-border-dark text-slate-200 text-xs font-medium rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to={`/candidates/${candidate.id}`}
          className="flex-1 py-2.5 bg-transparent border border-border-dark text-slate-200 rounded-lg text-sm font-semibold hover:bg-border-dark transition-colors text-center"
        >
          View Profile
        </Link>
        {onSave && (
          <button
            onClick={() => onSave(candidate)}
            className={`w-10 h-10 flex items-center justify-center border rounded-lg transition-colors ${
              saved
                ? 'border-primary text-primary bg-primary/10'
                : 'border-border-dark text-slate-400 hover:text-primary hover:border-primary'
            }`}
            title={saved ? 'Saved' : 'Save candidate'}
          >
            <span className={`material-symbols-outlined text-lg ${saved ? 'fill-icon text-primary' : ''}`}>bookmark</span>
          </button>
        )}
      </div>
    </div>
  )
}
