import './PageLoader.css';

export default function PageLoader() {
  return (
    <div className="page-loader" aria-label="Carregando">
      <div className="page-loader-spinner" />
      <span className="page-loader-text">Carregando...</span>
    </div>
  );
}
