import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="card hero">
      <h1>Welcome</h1>
      <p>
        This is a full-stack app: React in the browser, an Express.js API on the
        server, and a MySQL database.
      </p>
      <Link to="/users" className="btn primary">Manage users</Link>
    </section>
  );
}
