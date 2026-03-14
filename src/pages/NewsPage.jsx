import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

const TICKERS = [
  { sym: "S&P 500", val: "5,842.34", dir: 1,  chg: "+0.42%" },
  { sym: "DOW",     val: "43,102",   dir: 1,  chg: "+0.31%" },
  { sym: "NASDAQ",  val: "18,239",   dir: -1, chg: "-0.18%" },
  { sym: "10Y",     val: "4.21%",    dir: 1,  chg: "+0.03"  },
  { sym: "WTI",     val: "$82.17",   dir: 1,  chg: "+1.10%" },
  { sym: "BTC",     val: "$68,420",  dir: -1, chg: "-2.41%" },
  { sym: "EUR/USD", val: "1.0841",   dir: -1, chg: "-0.09%" },
  { sym: "GOLD",    val: "$2,341",   dir: 1,  chg: "+0.58%" },
];

function TickerBar() {
  const doubled = [...TICKERS, ...TICKERS];
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl overflow-hidden py-2 select-none mb-5">
      <div className="flex gap-8 w-max" style={{ animation: "ticker 30s linear infinite" }}>
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-1.5 shrink-0 px-2">
            <span className="text-slate-300 text-xs font-semibold tracking-widest uppercase">{t.sym}</span>
            <span className="text-white text-xs font-bold">{t.val}</span>
            <span className={`text-xs font-semibold ${t.dir > 0 ? "text-emerald-400" : "text-red-400"}`}>{t.chg}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Masthead() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl mb-6 overflow-hidden">
      <div className="px-6 py-2 flex justify-between items-center border-b border-slate-600/80">
        <span className="text-slate-300 text-xs tracking-widest uppercase font-medium hidden sm:block">{today}</span>
        <span className="text-amber-500 text-xs tracking-[0.25em] uppercase font-semibold mx-auto sm:mx-0">
          Markets · Business · World
        </span>
        <span className="text-slate-300 text-xs tracking-widest uppercase font-medium hidden sm:block">Est. 2024</span>
      </div>
      <div className="px-6 py-7 text-center">
        <h1
          className="text-white leading-none tracking-tight uppercase"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900 }}
        >
          The Daily Brief
        </h1>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-500/50" />
          <p className="text-amber-500/70 text-xs tracking-[0.3em] uppercase font-medium whitespace-nowrap">
            Authoritative · Independent · Essential
          </p>
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-500/50" />
        </div>
      </div>
    </div>
  );
}

function ArticleIcon({ className = "w-8 h-8 text-slate-500" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
      <path d="M3 9h18M9 21V9" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function HeroCard({ article, kicker }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 bg-slate-700 border border-slate-500/50 rounded-xl overflow-hidden">
      <div className="relative overflow-hidden min-h-64">
        {article.urlToImage ? (
          <img src={article.urlToImage} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full min-h-64 bg-slate-600 flex items-center justify-center">
            <ArticleIcon className="w-12 h-12 text-slate-500" />
          </div>
        )}
      </div>

      <div className="p-7 flex flex-col justify-between border-l border-slate-500/50">
        <div>
          <span className="inline-block bg-amber-500 text-slate-950 text-xs font-black tracking-widest uppercase px-2.5 py-1 mb-5">
            {kicker}
          </span>
          <h2 className="text-white leading-tight mb-4" style={{ fontFamily: "Georgia, serif" }}>
            {article.title}
          </h2>
          {article.description && (
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">{article.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-5 mt-6 border-t border-slate-500/50">
          <div>
            <p className="text-amber-500/70 text-xs tracking-widest uppercase font-semibold">
              {article.source?.name || "News"}
            </p>
            {article.publishedAt && (
              <p className="text-slate-400 text-xs mt-0.5">{fmt(article.publishedAt)}</p>
            )}
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-amber-400 text-xs font-bold tracking-widest uppercase"
          >
            <span>Full story</span>
            <ArrowIcon />
          </a>
        </div>
      </div>
    </div>
  );
}

function SmallCard({ article }) {
  return (
    <div className="bg-slate-700 border border-slate-500/50 rounded-xl flex flex-col overflow-hidden">
      {article.urlToImage ? (
        <img src={article.urlToImage} alt={article.title} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-slate-600 flex items-center justify-center">
          <ArticleIcon />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="text-white" style={{ fontFamily: "Georgia, serif" }}>
          {article.title}
        </h3>

        {article.description && (
          <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 flex-1">
            {article.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-500/50">
          <span className="text-amber-500/60 text-xs tracking-wider uppercase font-medium">
            {article.source?.name || ""}
          </span>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-300 text-xs font-semibold"
          >
            <span>Read</span>
            <ArrowIcon className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ articles, label }) {
  if (!articles.length) return null;
  const [hero, ...rest] = articles;

  return (
    <section className="mb-10">
      <h2 className="text-white mb-6">{label}</h2>

      <HeroCard article={hero} kicker="Featured" />

      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {rest.map((a, i) => (
            <SmallCard key={i} article={a} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function NewsPage() {
  const [stockArticles, setStockArticles] = useState([]);
  const [otherArticles, setOtherArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSection = async (url) => {
      const res = await fetch(url);
      const json = await res.json();
      if (json.status !== "ok") throw new Error(json.message || "Failed to fetch");
      return json.articles || [];
    };

    const load = async () => {
      try {
        const apiKey = process.env.REACT_APP_NEWS_API_KEY?.trim();

        const [stocks, general] = await Promise.all([
          fetchSection(`https://newsapi.org/v2/top-headlines?country=us&category=business&q=stocks&apiKey=${apiKey}`),
          fetchSection(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`)
        ]);

        setStockArticles(stocks);

        const seen = new Set(stocks.map((a) => a.title));
        setOtherArticles(general.filter((a) => !seen.has(a.title)));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Layout title="News Feed">

      <TickerBar />
      <Masthead />

      {loading && <p className="text-center py-40 text-slate-400">Fetching latest news...</p>}

      {error && (
        <p className="text-center py-40 text-red-400">
          Could not load news: {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <Section articles={stockArticles} label="Markets & Finance" />
          <Section articles={otherArticles} label="Top Headlines" />
        </>
      )}

    </Layout>
  );
}