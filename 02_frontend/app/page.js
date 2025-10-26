async function getAttractions() {
  const res = await fetch("http://localhost:3000/api/attractions", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default async function Page() {
  const rows = await getAttractions();

  return (
    <main className="container">
      <header className="header">
        <h1 className="title">Attractions</h1>
        <p className="subtitle">Discover points of interest nearby</p>
      </header>

      {!rows || rows.length === 0 ? (
        <div className="empty">No attractions found.</div>
      ) : (
        <section className="grid" aria-live="polite">
          {rows.map((x) => (
            <article key={x.id} className="card" tabIndex={0}>
              {x.coverimage && (
                <div className="media">
                  <img
                    src={x.coverimage}
                    alt={x.name}
                    className="img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              <div className="body">
                <h3 className="card-title">{x.name}</h3>
                {x.detail && <p className="detail">{x.detail}</p>}
                <div className="meta">
                  <small>
                    Lat: <span className="code">{x.latitude}</span> · Lng:{" "}
                    <span className="code">{x.longitude}</span>
                  </small>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
