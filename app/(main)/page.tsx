import LatestSubscribers from "../../components/othercomponents/latestSubscribers";
import NewArticles from "../../components/othercomponents/newArticles";
import { getDashboardStats } from "./actions/Dashboard";

export default async function Home() {
  const stats = await getDashboardStats();

  return (
    <main className="bg-primary min-h-screen w-full py-10">
      <div className="px-5 md:px-10 space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-950 p-6 rounded-lg shadow-sm border border-slate-800">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Subscribers</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{stats.subscribers}</span>
              <span className="text-xs text-green-400 font-medium">({stats.activeSubscribers} Active)</span>
            </div>
          </div>
          
          <div className="bg-blue-950 p-6 rounded-lg shadow-sm border border-slate-800">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Articles</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{stats.articles}</span>
              <span className="text-xs text-blue-400 font-medium">Published</span>
            </div>
          </div>

          <div className="bg-blue-950 p-6 rounded-lg shadow-sm border border-slate-800">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Comments</h3>
             <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{stats.comments}</span>
              <span className="text-xs text-purple-400 font-medium">Engagement</span>
             </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-2/3">
            <h1 className="text-white font-semibold text-lg md:text-2xl mb-4">
              Latest articles
            </h1>
            <NewArticles />
          </div>
          <div className="w-full md:w-1/3">
            <h1 className="text-white font-semibold text-lg md:text-2xl mb-4">
              Latest subscribers
            </h1>
            <LatestSubscribers />
          </div>
        </div>
      </div>
    </main>
  );
}
