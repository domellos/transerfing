import { Link } from 'react-router';
import { useTitle } from '../lib/hooks';

export default function NotFound() {
  useTitle('Nie znaleziono');
  return (
    <div className="page narrow center">
      <p className="eyebrow">404</p>
      <h1>Ten kadr się nie zrealizował</h1>
      <p className="lead">Strona, której szukasz, nie istnieje albo zmieniła adres.</p>
      <div className="form-actions center">
        <Link to="/" className="btn btn-primary">
          Strona główna
        </Link>
        <Link to="/wiedza/" className="btn">
          Wiedza
        </Link>
      </div>
    </div>
  );
}
